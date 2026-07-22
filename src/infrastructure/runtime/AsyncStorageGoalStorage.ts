import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  ClockPort,
  GoalPolicy,
  GoalStoragePort,
  GoalsState,
} from "../../application/ports/runtime";

const STORAGE_KEY = "taxi_goals";
const STORAGE_SCHEMA_VERSION = 2;

const DEFAULT_GOALS: GoalsState = Object.freeze({
  daily: 0,
  weekly: 0,
  monthly: 0,
});

type GoalPolicyVersion = GoalPolicy;

type GoalHistoryEnvelope = Readonly<{
  schemaVersion: 2;
  nextPolicySequence: number;
  policies: readonly GoalPolicyVersion[];
}>;

type StoredGoalPolicy = Partial<GoalPolicyVersion> & {
  id?: unknown;
  effectiveAt?: unknown;
  goals?: unknown;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isGoalsStateLike(value: unknown): value is GoalsState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GoalsState>;
  return (
    isFiniteNumber(candidate.daily) &&
    isFiniteNumber(candidate.weekly) &&
    isFiniteNumber(candidate.monthly)
  );
}

function createGoalPolicy(
  id: string,
  goals: GoalsState,
  effectiveAt: Date,
): GoalPolicyVersion {
  return {
    id,
    effectiveAt: effectiveAt.toISOString(),
    goals: {
      daily: goals.daily,
      weekly: goals.weekly,
      monthly: goals.monthly,
    },
  };
}

function normalizePolicyVersion(
  value: unknown,
  fallbackId?: string,
): GoalPolicyVersion | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as StoredGoalPolicy;
  const id =
    typeof candidate.id === "string" && candidate.id.trim().length > 0
      ? candidate.id
      : fallbackId;

  if (
    !id ||
    typeof candidate.effectiveAt !== "string" ||
    !isGoalsStateLike(candidate.goals)
  ) {
    return null;
  }

  return {
    id,
    effectiveAt: candidate.effectiveAt,
    goals: {
      daily: candidate.goals.daily,
      weekly: candidate.goals.weekly,
      monthly: candidate.goals.monthly,
    },
  };
}

function normalizeEnvelope(value: unknown): {
  envelope: GoalHistoryEnvelope;
  shouldRewrite: boolean;
} | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<GoalHistoryEnvelope> & {
    policies?: unknown;
    nextPolicySequence?: unknown;
    schemaVersion?: unknown;
  };

  const policies = Array.isArray(candidate.policies)
    ? candidate.policies
        .map((policy, index) =>
          normalizePolicyVersion(policy, `goal-${index + 1}`),
        )
        .filter((policy): policy is GoalPolicyVersion => policy !== null)
        .sort((left, right) => {
          const leftTime = Date.parse(left.effectiveAt);
          const rightTime = Date.parse(right.effectiveAt);

          if (leftTime !== rightTime) {
            return leftTime - rightTime;
          }

          return left.id.localeCompare(right.id);
        })
    : [];

  const nextPolicySequence = isFiniteNumber(candidate.nextPolicySequence)
    ? Math.max(candidate.nextPolicySequence, policies.length + 1)
    : policies.length + 1;

  if (candidate.schemaVersion === STORAGE_SCHEMA_VERSION) {
    const normalizedEnvelope: GoalHistoryEnvelope = {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      nextPolicySequence,
      policies,
    };

    const currentPolicyCount =
      Array.isArray(candidate.policies) && candidate.policies.length === policies.length;
    const currentSequenceMatches = candidate.nextPolicySequence === nextPolicySequence;
    const idsPresent = policies.every((policy, index) => {
      const original = Array.isArray(candidate.policies)
        ? candidate.policies[index]
        : null;
      return (
        !!original &&
        typeof (original as StoredGoalPolicy).id === "string" &&
        (original as StoredGoalPolicy).id === policy.id
      );
    });

    return {
      envelope: normalizedEnvelope,
      shouldRewrite: !(currentPolicyCount && currentSequenceMatches && idsPresent),
    };
  }

  if (candidate.schemaVersion === 1 || !candidate.schemaVersion) {
    return {
      envelope: {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        nextPolicySequence,
        policies,
      },
      shouldRewrite: true,
    };
  }

  return null;
}

function resolveGoalsAt(
  policies: readonly GoalPolicyVersion[],
  reference: Date,
): GoalsState | null {
  const referenceTime = reference.getTime();

  for (let index = policies.length - 1; index >= 0; index -= 1) {
    const policy = policies[index];
    const policyTime = Date.parse(policy.effectiveAt);

    if (Number.isNaN(policyTime)) {
      continue;
    }

    if (policyTime <= referenceTime) {
      return {
        daily: policy.goals.daily,
        weekly: policy.goals.weekly,
        monthly: policy.goals.monthly,
      };
    }
  }

  return null;
}

export class AsyncStorageGoalStorage implements GoalStoragePort {
  constructor(private readonly clock: ClockPort = { now: () => new Date() }) {}

  private now(): Date {
    return this.clock.now();
  }

  private async loadEnvelope(): Promise<GoalHistoryEnvelope> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        nextPolicySequence: 1,
        policies: [],
      };
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      if (isGoalsStateLike(parsed)) {
        const migratedEnvelope: GoalHistoryEnvelope = {
          schemaVersion: STORAGE_SCHEMA_VERSION,
          nextPolicySequence: 2,
          policies: [createGoalPolicy("goal-1", parsed, this.now())],
        };
        await this.persistEnvelope(migratedEnvelope);
        return migratedEnvelope;
      }

      const normalized = normalizeEnvelope(parsed);

      if (!normalized) {
        return {
          schemaVersion: STORAGE_SCHEMA_VERSION,
          nextPolicySequence: 1,
          policies: [],
        };
      }

      if (normalized.shouldRewrite) {
        await this.persistEnvelope(normalized.envelope);
      }

      return normalized.envelope;
    } catch {
      return {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        nextPolicySequence: 1,
        policies: [],
      };
    }
  }

  private async persistEnvelope(
    envelope: GoalHistoryEnvelope,
  ): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  }

  async getGoals(): Promise<GoalsState> {
    const envelope = await this.loadEnvelope();
    const lastPolicy = envelope.policies[envelope.policies.length - 1];

    if (!lastPolicy) {
      return DEFAULT_GOALS;
    }

    return {
      daily: lastPolicy.goals.daily,
      weekly: lastPolicy.goals.weekly,
      monthly: lastPolicy.goals.monthly,
    };
  }

  async getCurrentGoalPolicy(): Promise<GoalPolicy | null> {
    const envelope = await this.loadEnvelope();
    const lastPolicy = envelope.policies[envelope.policies.length - 1];
    return lastPolicy ? { ...lastPolicy, goals: { ...lastPolicy.goals } } : null;
  }

  async getGoalsAt(reference: Date): Promise<GoalsState | null> {
    const envelope = await this.loadEnvelope();
    return resolveGoalsAt(envelope.policies, reference);
  }

  async getGoalHistory(): Promise<readonly GoalPolicy[]> {
    const envelope = await this.loadEnvelope();
    return envelope.policies.map((policy) => ({
      id: policy.id,
      effectiveAt: policy.effectiveAt,
      goals: {
        daily: policy.goals.daily,
        weekly: policy.goals.weekly,
        monthly: policy.goals.monthly,
      },
    }));
  }

  async getGoalPolicyById(id: string): Promise<GoalPolicy | null> {
    const envelope = await this.loadEnvelope();
    const policy = envelope.policies.find((item) => item.id === id);
    return policy
      ? {
          id: policy.id,
          effectiveAt: policy.effectiveAt,
          goals: {
            daily: policy.goals.daily,
            weekly: policy.goals.weekly,
            monthly: policy.goals.monthly,
          },
        }
      : null;
  }

  async saveGoals(goals: GoalsState): Promise<void> {
    const envelope = await this.loadEnvelope();
    const nextPolicy = createGoalPolicy(
      `goal-${envelope.nextPolicySequence}`,
      goals,
      this.now(),
    );
    const nextEnvelope: GoalHistoryEnvelope = {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      nextPolicySequence: envelope.nextPolicySequence + 1,
      policies: [...envelope.policies, nextPolicy],
    };

    await this.persistEnvelope(nextEnvelope);
  }
}

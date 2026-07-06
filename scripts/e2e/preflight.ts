import {
  AndroidPreflightCheck,
  AndroidPreflightResult,
  runAndroidPreflight,
} from "./android";
import { MaestroPreflightCheck, MaestroPreflightResult, runMaestroPreflight } from "./maestro";

export type PreflightPlan = Readonly<{
  phase: "preflight";
  checks: readonly (AndroidPreflightCheck | MaestroPreflightCheck)[];
}>;

export type PreflightResult = Readonly<{
  ok: boolean;
  android: AndroidPreflightResult;
  maestro: MaestroPreflightResult;
  checks: readonly (AndroidPreflightCheck | MaestroPreflightCheck)[];
}>;

export function buildPreflightPlan(rootDir = process.cwd()): PreflightPlan {
  const android = runAndroidPreflight(rootDir);
  const maestro = runMaestroPreflight(rootDir);

  return {
    phase: "preflight",
    checks: [...android.checks, ...maestro.checks],
  };
}

export function describePreflightPlan(plan: PreflightPlan): string[] {
  return plan.checks.map((check) => `${check.label}: ${check.message}`);
}

export function createEmptyPreflightResult(rootDir = process.cwd()): PreflightResult {
  const android = runAndroidPreflight(rootDir);
  const maestro = runMaestroPreflight(rootDir);

  return {
    ok: android.ok && maestro.ok,
    android,
    maestro,
    checks: [...android.checks, ...maestro.checks],
  };
}

export function executePreflight(rootDir = process.cwd()) {
  const android = runAndroidPreflight(rootDir);
  const maestro = runMaestroPreflight(rootDir);

  return {
    ok: android.ok && maestro.ok,
    android,
    maestro,
    checks: [...android.checks, ...maestro.checks],
  };
}

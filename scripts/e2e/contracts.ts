export type ValidationMode = "validate" | "validate:full";

export type ValidationPhase =
  | "pending"
  | "preflight"
  | "android"
  | "install"
  | "launch"
  | "smoke"
  | "collect"
  | "report"
  | "completed"
  | "failed";

export type ValidationStepStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export type ValidationStep = Readonly<{
  id: string;
  label: string;
  status: ValidationStepStatus;
  startedAt?: string;
  endedAt?: string;
  message?: string;
  details?: readonly string[];
}>;

export type ValidationArtifact = Readonly<{
  kind:
    | "log"
    | "screenshot"
    | "report"
    | "apk"
    | "emulator"
    | "build"
    | "output"
    | "flow"
    | "config";
  label: string;
  path?: string;
  description: string;
}>;

export type ValidationError = Readonly<{
  stepId: string;
  message: string;
  details?: readonly string[];
}>;

export type ValidationContext = Readonly<{
  mode: ValidationMode;
  rootDir: string;
  androidSdkRoot: string | null;
  adbPath: string | null;
  emulatorPath: string | null;
  avdName: string | null;
  apkPath: string | null;
  packageName: string;
  mainActivity: string;
}>;

export type ValidationResult = Readonly<{
  ok: boolean;
  phase: ValidationPhase;
  steps: readonly ValidationStep[];
  artifacts: readonly ValidationArtifact[];
  errors: readonly ValidationError[];
  startedAt: string;
  endedAt: string;
  durationMs: number;
}>;

export type ValidationReport = Readonly<{
  title: string;
  summary: string;
  context: ValidationContext;
  result: ValidationResult;
}>;

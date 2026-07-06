import { performance } from "perf_hooks";

import {
  ensureEmulatorRunning,
  installApk,
  launchApp,
  resolveAndroidEnvironment,
} from "./android";
import {
  ValidationArtifact,
  ValidationContext,
  ValidationError,
  ValidationMode,
  ValidationPhase,
  ValidationStep,
} from "./contracts";
import { buildValidationError, buildValidationReport, formatValidationSummary, persistValidationReport } from "./report";
import { executePreflight } from "./preflight";
import {
  createMaestroArtifacts,
  persistMaestroSmokeResults,
  resolveMaestroRuntime,
  runMaestroSmoke,
} from "./maestro";
import { ensureDirectory, repoRoot, runCommand, toBinPath } from "./utils";

type PlannedStep = Readonly<{
  id: string;
  label: string;
}>;

type SmokeArtifacts = Readonly<{
  screenshotPath: string | null;
  reportJsonPath: string;
  reportMdPath: string;
  logPath: string;
}>;

function parseMode(value: string | undefined): ValidationMode {
  return value === "validate:full" ? "validate:full" : "validate";
}

function buildPlannedSteps(mode: ValidationMode): PlannedStep[] {
  if (mode === "validate") {
    return [
      { id: "typescript", label: "TypeScript" },
      { id: "jest", label: "Jest" },
    ];
  }

  return [
    { id: "typescript", label: "TypeScript" },
    { id: "jest", label: "Jest" },
    { id: "preflight", label: "Preflight" },
    { id: "android", label: "Android" },
    { id: "install", label: "Install" },
    { id: "launch", label: "Launch" },
    { id: "smoke", label: "Smoke" },
    { id: "collect", label: "Collect" },
    { id: "report", label: "Report" },
    { id: "completed", label: "Completed" },
  ];
}

function printPlan(mode: ValidationMode): void {
  const steps = buildPlannedSteps(mode);

  console.log("TaxiGeo validation runner");
  console.log(`Mode: ${mode}`);
  console.log("Estado: infraestructura de Android y Maestro preparada.");
  console.log("Fases previstas:");

  steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step.label} [planned:${step.id}]`);
  });
}

function createContext(mode: ValidationMode, environment: ReturnType<typeof resolveAndroidEnvironment>) {
  const maestroRuntime = resolveMaestroRuntime(repoRoot);
  const context: ValidationContext = {
    mode,
    rootDir: repoRoot,
    androidSdkRoot: environment.sdkRoot,
    adbPath: environment.adbPath,
    emulatorPath: environment.emulatorPath,
    avdName: environment.selectedAvdName,
    apkPath: environment.apkPath,
    packageName: environment.packageName,
    mainActivity: environment.mainActivity,
  };

  return {
    context,
    maestroRuntime,
  };
}

function buildArtifacts(
  context: ValidationContext,
  maestroRuntime: ReturnType<typeof resolveMaestroRuntime>,
): ValidationArtifact[] {
  const artifacts: ValidationArtifact[] = [];

  if (context.apkPath) {
    artifacts.push({
      kind: "apk",
      label: "Development APK",
      path: context.apkPath,
      description: "APK usada para instalación en el emulador.",
    });
  }

  if (context.adbPath) {
    artifacts.push({
      kind: "build",
      label: "adb",
      path: context.adbPath,
      description: "Herramienta ADB localizada para la fase Android.",
    });
  }

  if (context.emulatorPath) {
    artifacts.push({
      kind: "emulator",
      label: "emulator",
      path: context.emulatorPath,
      description: "Binario del emulador Android.",
    });
  }

  artifacts.push(...createMaestroArtifacts(context, maestroRuntime));

  return artifacts;
}

async function runPhase<T>(
  steps: ValidationStep[],
  phaseId: string,
  label: string,
  task: () => Promise<T> | T,
) {
  const step: ValidationStep = {
    id: phaseId,
    label,
    status: "running",
    startedAt: new Date().toISOString(),
  };
  steps.push(step);

  try {
    const result = await task();
    steps[steps.length - 1] = {
      ...step,
      status: "passed",
      endedAt: new Date().toISOString(),
      message: "OK",
    };
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    steps[steps.length - 1] = {
      ...step,
      status: "failed",
      endedAt: new Date().toISOString(),
      message,
    };
    throw error;
  }
}

function updateLastStep(steps: ValidationStep[], patch: Partial<ValidationStep>) {
  const last = steps[steps.length - 1];
  if (!last) {
    return;
  }

  steps[steps.length - 1] = {
    ...last,
    ...patch,
  };
}

function resolveTypecheckCommand() {
  return toBinPath("tsc");
}

function resolveJestCommand() {
  return toBinPath("jest");
}

function runTypeScriptCheck() {
  runCommand(resolveTypecheckCommand(), ["--noEmit"]);
}

function runJestSuite() {
  runCommand(resolveJestCommand(), ["--runInBand"]);
}

function buildFinalResult(params: {
  ok: boolean;
  phase: ValidationPhase;
  steps: ValidationStep[];
  artifacts: ValidationArtifact[];
  errors: ValidationError[];
  startedAt: number;
  endedAt: number;
}) {
  const durationMs = params.endedAt - params.startedAt;

  return {
    ok: params.ok,
    phase: params.phase,
    steps: params.steps,
    artifacts: params.artifacts,
    errors: params.errors,
    startedAt: new Date(Date.now() - durationMs).toISOString(),
    endedAt: new Date().toISOString(),
    durationMs,
  };
}

async function runFullValidation(mode: ValidationMode) {
  const steps: ValidationStep[] = [];
  const startedAt = performance.now();
  const environment = resolveAndroidEnvironment(repoRoot);
  const { context, maestroRuntime } = createContext(mode, environment);
  const artifacts = buildArtifacts(context, maestroRuntime);
  const errors: ValidationError[] = [];
  let phase: ValidationPhase = "pending";
  let smokeResult: Awaited<ReturnType<typeof runMaestroSmoke>> | null = null;
  let smokeArtifacts: SmokeArtifacts | null = null;
  let terminalMessage = "Validación detenida antes de completar el smoke.";
  let validationPassed = false;

  try {
    await runPhase(steps, "typescript", "TypeScript", runTypeScriptCheck);
    await runPhase(steps, "jest", "Jest", runJestSuite);

    phase = "preflight";
    const preflight = await runPhase(steps, "preflight", "Preflight Android y Maestro", () => executePreflight(repoRoot));
      if (!preflight.ok) {
      preflight.checks
        .filter((check) => check.required && !check.ok)
        .forEach((check) => {
          errors.push(buildValidationError("preflight", check.message, [check.label]));
        });
      phase = "failed";
      terminalMessage = "El preflight bloqueó la ejecución antes de Android y Maestro.";
        steps.push({
          id: "failed",
          label: "Failed",
          status: "failed",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          message: terminalMessage,
        });
      } else {
      phase = "android";
      const androidState = await runPhase(steps, "android", "Android emulator", async () => {
        return ensureEmulatorRunning(environment);
      });

      phase = "install";
      await runPhase(steps, "install", "Install app", async () => {
        if (!context.adbPath || !context.apkPath) {
          throw new Error("Faltan adb o APK para instalar la aplicación.");
        }

        installApk(context.adbPath, androidState.serial, context.apkPath);
      });

      phase = "launch";
      await runPhase(steps, "launch", "Launch app", async () => {
        if (!context.adbPath) {
          throw new Error("Falta adb para lanzar la aplicación.");
        }

        await launchApp(context.adbPath, androidState.serial, context.packageName, context.mainActivity);
      });

      phase = "smoke";
      smokeResult = await runPhase(steps, "smoke", "Maestro smoke", async () => {
        return runMaestroSmoke(context, maestroRuntime, androidState.serial);
      });

      if (!smokeResult.ok) {
        updateLastStep(steps, {
          status: "failed",
          message: smokeResult.message,
          details: smokeResult.failureCategory ? [smokeResult.failureCategory] : undefined,
        });
        errors.push(
          buildValidationError(
            "smoke",
            smokeResult.message,
            smokeResult.failureCategory ? [smokeResult.failureCategory] : undefined,
          ),
        );
        phase = "failed";
        terminalMessage = smokeResult.message;
      } else {
        updateLastStep(steps, {
          message: "Smoke completado correctamente.",
          details: smokeResult.screenshotPath ? [smokeResult.screenshotPath] : undefined,
        });
        terminalMessage = "Smoke validado y artefactos persistidos.";
      }

      const smokeOutcome = smokeResult;
      if (!smokeOutcome) {
        throw new Error("El smoke no produjo un resultado válido.");
      }

      phase = "collect";
      smokeArtifacts = await runPhase(steps, "collect", "Collect", async () => {
        return persistMaestroSmokeResults(context, maestroRuntime, smokeOutcome);
      });

      updateLastStep(steps, {
        message: smokeOutcome.ok
          ? "Captura y artefactos persistidos."
          : "Artefactos persistidos tras un smoke fallido.",
        details: smokeArtifacts?.screenshotPath ? [smokeArtifacts.screenshotPath] : undefined,
      });

      phase = "report";
      await runPhase(steps, "report", "Report", async () => {
        ensureDirectory(maestroRuntime.reportDir);
      });

      updateLastStep(steps, {
        message: "Resumen preparado para persistencia.",
      });

      validationPassed = smokeOutcome.ok;
      if (smokeOutcome.ok) {
        steps.push({
          id: "completed",
          label: "Completed",
          status: "passed",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          message: terminalMessage,
        });
      } else {
        steps.push({
          id: "failed",
          label: "Failed",
          status: "failed",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          message: terminalMessage,
        });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(buildValidationError(phase, message));
    phase = "failed";
    terminalMessage = message;
    validationPassed = false;
    steps.push({
      id: "failed",
      label: "Failed",
      status: "failed",
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      message,
    });
  } finally {
    const endedAt = performance.now();
    const ok = validationPassed;
    const result = buildFinalResult({
      ok,
      phase: ok ? "completed" : "failed",
      steps,
      artifacts,
      errors,
      startedAt,
      endedAt,
    });

    const report = buildValidationReport(context, result);
    persistValidationReport(report, maestroRuntime.reportDir);

    for (const line of formatValidationSummary(report)) {
      console.log(line);
    }

    if (smokeResult && smokeArtifacts) {
      console.log("");
      console.log("Smoke artifacts:");
      console.log(`- screenshot: ${smokeArtifacts.screenshotPath}`);
      console.log(`- report json: ${smokeArtifacts.reportJsonPath}`);
      console.log(`- report md: ${smokeArtifacts.reportMdPath}`);
      console.log(`- log: ${smokeArtifacts.logPath}`);
    }

    if (!ok) {
      process.exitCode = 1;
    }
  }
}

async function main() {
  const mode = parseMode((process.argv[2] ?? "validate").trim());
  printPlan(mode);

  if (mode === "validate") {
    runTypeScriptCheck();
    runJestSuite();
    console.log("VALIDACIÓN APROBADA");
    return;
  }

  await runFullValidation(mode);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

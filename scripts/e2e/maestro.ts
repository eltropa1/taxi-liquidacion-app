import fs from "fs";
import path from "path";

import {
  copyFile,
  ensureDirectory,
  listFilesRecursive,
  normalizeWindowsPath,
  readJsonFile,
  removeDirectoryContents,
  runCommandCapture,
  writeJsonFile,
  writeTextFile,
} from "./utils";
import { ValidationArtifact, ValidationContext, ValidationStep } from "./contracts";

type AppJson = {
  expo?: {
    android?: {
      package?: string;
    };
  };
};

export type MaestroPreflightCheck = Readonly<{
  id: string;
  label: string;
  ok: boolean;
  required: boolean;
  message: string;
}>;

export type MaestroPreflightResult = Readonly<{
  ok: boolean;
  checks: readonly MaestroPreflightCheck[];
  runtime: MaestroRuntime;
}>;

export type MaestroRuntime = Readonly<{
  homeDir: string | null;
  javaPath: string | null;
  classpath: string | null;
  flowPath: string;
  configPath: string;
  screenshotDir: string;
  logsDir: string;
  reportDir: string;
  screenshotFile: string;
  reportJsonPath: string;
  reportMdPath: string;
  logPath: string;
}>;

export type MaestroRunOutcome = Readonly<{
  ok: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
  command: string[];
  screenshotPath: string | null;
  reportPath: string | null;
  logPath: string | null;
  failureCategory: "connectivity" | "bootstrap" | "home" | "launch" | "unknown" | null;
  message: string;
}>;

function readAppPackageName(rootDir: string) {
  const appJsonPath = path.join(rootDir, "app.json");
  const appJson = readJsonFile<AppJson>(appJsonPath);
  return appJson.expo?.android?.package ?? "com.taxiliquidacionapp";
}

function resolveJavaPath() {
  const candidates = process.platform === "win32"
    ? ["java.exe", "java"]
    : ["java"];

  for (const candidate of candidates) {
    const result = runCommandCapture(process.platform === "win32" ? "where.exe" : "which", [candidate]);
    const resolved = (result.stdout ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);

    if (resolved && fs.existsSync(resolved)) {
      return resolved;
    }
  }

  return null;
}

function resolveMaestroHome() {
  const envHome = process.env.MAESTRO_HOME?.trim();
  if (envHome && fs.existsSync(envHome)) {
    return path.resolve(envHome);
  }

  const localAppDataHome = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, "maestro", "maestro")
    : null;
  if (localAppDataHome && fs.existsSync(localAppDataHome)) {
    return path.resolve(localAppDataHome);
  }

  const stableHome = process.env.USERPROFILE
    ? path.join(process.env.USERPROFILE, "maestro")
    : null;
  if (stableHome && fs.existsSync(stableHome)) {
    return path.resolve(stableHome);
  }

  return null;
}

function resolveMaestroClasspath(homeDir: string | null) {
  if (!homeDir) {
    return null;
  }

  const libDir = path.join(homeDir, "lib");
  if (!fs.existsSync(libDir)) {
    return null;
  }

  return `${libDir}${path.sep}*`;
}

export function resolveMaestroRuntime(rootDir: string): MaestroRuntime {
  const homeDir = resolveMaestroHome();
  const javaPath = resolveJavaPath();
  const classpath = resolveMaestroClasspath(homeDir);
  const screenshotDir = path.join(rootDir, "tests", "e2e", "screenshots", "latest");
  const logsDir = path.join(rootDir, "tests", "e2e", "logs", "latest");
  const reportDir = path.join(rootDir, "tests", "e2e", "reports", "latest");

  return {
    homeDir,
    javaPath,
    classpath,
    flowPath: path.join(rootDir, "tests", "e2e", "flows", "smoke.app-launch.yaml"),
    configPath: path.join(rootDir, "tests", "e2e", "config", "maestro.yaml"),
    screenshotDir,
    logsDir,
    reportDir,
    screenshotFile: path.join(screenshotDir, "smoke.app-launch.png"),
    reportJsonPath: path.join(reportDir, "smoke.app-launch.json"),
    reportMdPath: path.join(reportDir, "smoke.app-launch.md"),
    logPath: path.join(logsDir, "maestro.log"),
  };
}

function buildMaestroChecks(runtime: MaestroRuntime): MaestroPreflightCheck[] {
  return [
    {
      id: "maestro-home",
      label: "Maestro CLI",
      required: true,
      ok: runtime.homeDir !== null && runtime.classpath !== null,
      message: runtime.homeDir
        ? `Maestro localizado en ${normalizeWindowsPath(runtime.homeDir)}`
        : "No se encontró Maestro CLI. Debe instalarse el paquete oficial antes de ejecutar smoke tests.",
    },
    {
      id: "java",
      label: "Java",
      required: true,
      ok: runtime.javaPath !== null,
      message: runtime.javaPath
        ? `Java detectado en ${normalizeWindowsPath(runtime.javaPath)}`
        : "No se pudo localizar Java 17+. Maestro depende de Java para arrancar.",
    },
    {
      id: "flow",
      label: "Smoke flow",
      required: true,
      ok: fs.existsSync(runtime.flowPath),
      message: fs.existsSync(runtime.flowPath)
        ? `Flow disponible en ${normalizeWindowsPath(runtime.flowPath)}`
        : "Falta el flow smoke.app-launch.yaml en tests/e2e/flows.",
    },
    {
      id: "config",
      label: "Maestro config",
      required: true,
      ok: fs.existsSync(runtime.configPath),
      message: fs.existsSync(runtime.configPath)
        ? `Config disponible en ${normalizeWindowsPath(runtime.configPath)}`
        : "Falta la configuración mínima de Maestro en tests/e2e/config/maestro.yaml.",
    },
    {
      id: "output",
      label: "Output dirs",
      required: true,
      ok: true,
      message: "Los directorios latest se crearán o limpiarán antes de cada ejecución.",
    },
  ];
}

export function runMaestroPreflight(rootDir: string): MaestroPreflightResult {
  const runtime = resolveMaestroRuntime(rootDir);
  const checks = buildMaestroChecks(runtime);
  const ok = checks.every((check) => !check.required || check.ok);

  return { ok, checks, runtime };
}

function prepareMaestroDirectories(runtime: MaestroRuntime) {
  ensureDirectory(runtime.screenshotDir);
  ensureDirectory(runtime.logsDir);
  ensureDirectory(runtime.reportDir);
  removeDirectoryContents(runtime.screenshotDir);
  removeDirectoryContents(runtime.logsDir);
  removeDirectoryContents(runtime.reportDir);
}

function buildMaestroCommand(
  runtime: MaestroRuntime,
  serial: string,
) {
  if (!runtime.javaPath || !runtime.classpath) {
    throw new Error("No se puede construir el comando Maestro porque faltan Java o classpath.");
  }

  return [
    runtime.javaPath,
    "-cp",
    runtime.classpath,
    "maestro.cli.AppKt",
    "--no-ansi",
    "--device",
    serial,
    "test",
    "--config",
    runtime.configPath,
    "--test-output-dir",
    runtime.screenshotDir,
    "--debug-output",
    runtime.logsDir,
    runtime.flowPath,
  ].filter((token) => token !== "");
}

function classifyFailure(stdout: string, stderr: string): MaestroRunOutcome["failureCategory"] {
  const output = `${stdout}\n${stderr}`.toLowerCase();

  if (
    output.includes("no connected devices") ||
    output.includes("unable to find devices") ||
    output.includes("device not found") ||
    output.includes("no such device")
  ) {
    return "connectivity";
  }

  if (output.includes("boot") || output.includes("bootstrap") || output.includes("timeout")) {
    return "bootstrap";
  }

  if (output.includes("assertvisible") && output.includes("taxi · liquidación diaria")) {
    return "home";
  }

  if (output.includes("app did not launch") || output.includes("launchapp")) {
    return "launch";
  }

  return "unknown";
}

function didCommandTimeout(result: ReturnType<typeof runCommandCapture>) {
  const error = result.error as NodeJS.ErrnoException | undefined;
  return error?.code === "ETIMEDOUT" || result.signal === "SIGTERM" || result.signal === "SIGKILL";
}

function buildSmokeErrorMessage(category: MaestroRunOutcome["failureCategory"], stdout: string, stderr: string) {
  const output = `${stdout}\n${stderr}`.trim();

  switch (category) {
    case "connectivity":
      return "Maestro no pudo conectarse al emulador o al dispositivo Android.";
    case "bootstrap":
      return "El bootstrap no terminó o Maestro agotó el tiempo de espera durante la inicialización.";
    case "home":
      return "La pantalla principal no apareció o no cumplió la aserción de visibilidad.";
    case "launch":
      return "La app no respondió al intento de apertura realizado por Maestro.";
    default:
      return output.length > 0 ? output : "Maestro falló sin devolver diagnóstico útil.";
  }
}

function readLatestPng(directoryPath: string) {
  const candidates = listFilesRecursive(directoryPath).filter((candidate) => candidate.toLowerCase().endsWith(".png"));
  if (candidates.length === 0) {
    return null;
  }

  return candidates
    .map((candidate) => ({ candidate, stat: fs.statSync(candidate) }))
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)[0]?.candidate ?? null;
}

function readLatestLog(directoryPath: string) {
  const candidates = listFilesRecursive(directoryPath).filter((candidate) => candidate.toLowerCase().endsWith(".log"));
  if (candidates.length === 0) {
    return null;
  }

  return candidates
    .map((candidate) => ({ candidate, stat: fs.statSync(candidate) }))
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)[0]?.candidate ?? null;
}

function pruneDirectoryKeepingFile(directoryPath: string, filePath: string) {
  if (!fs.existsSync(directoryPath)) {
    return;
  }

  const keepName = path.basename(filePath);
  for (const entry of fs.readdirSync(directoryPath)) {
    const entryPath = path.join(directoryPath, entry);
    if (entry === keepName && fs.existsSync(entryPath) && fs.statSync(entryPath).isFile()) {
      continue;
    }
    fs.rmSync(entryPath, { recursive: true, force: true });
  }
}

function captureAdbScreenshot(adbPath: string, serial: string, targetPath: string) {
  const safeSerial = serial.replace(/[^a-zA-Z0-9._-]/g, "_");
  const remotePath = `/sdcard/taxi-smoke-${safeSerial}.png`;
  ensureDirectory(path.dirname(targetPath));
  const captureResult = runCommandCapture(adbPath, ["-s", serial, "shell", "screencap", "-p", remotePath], {
    timeoutMs: 30_000,
  });
  if (captureResult.status !== 0) {
    return false;
  }

  const pullResult = runCommandCapture(adbPath, ["-s", serial, "pull", remotePath, targetPath], {
    timeoutMs: 30_000,
  });
  if (pullResult.status !== 0 || !fs.existsSync(targetPath)) {
    return false;
  }

  return true;
}

export function createMaestroArtifacts(context: ValidationContext, runtime: MaestroRuntime): ValidationArtifact[] {
  return [
    {
      kind: "flow",
      label: "Smoke flow",
      path: runtime.flowPath,
      description: "Flow Maestro mínimo para validar arranque y Home.",
    },
    {
      kind: "config",
      label: "Maestro config",
      path: runtime.configPath,
      description: "Configuración mínima desacoplada para ejecutar el smoke.",
    },
    {
      kind: "screenshot",
      label: "Smoke screenshot",
      path: runtime.screenshotFile,
      description: "Captura asociada al smoke.",
    },
    {
      kind: "report",
      label: "Smoke report JSON",
      path: runtime.reportJsonPath,
      description: "Resultado persistido del smoke.",
    },
    {
      kind: "report",
      label: "Smoke report Markdown",
      path: runtime.reportMdPath,
      description: "Resumen legible del smoke.",
    },
    {
      kind: "log",
      label: "Maestro log",
      path: runtime.logPath,
      description: "Log de ejecución generado por Maestro.",
    },
  ];
}

export async function runMaestroSmoke(
  context: ValidationContext,
  runtime: MaestroRuntime,
  serial: string,
): Promise<MaestroRunOutcome> {
  if (!runtime.javaPath || !runtime.classpath) {
    throw new Error("Maestro no está disponible en el entorno.");
  }

  prepareMaestroDirectories(runtime);

  const command = buildMaestroCommand(runtime, serial);
  const startedAt = Date.now();
  const env = {
    ...process.env,
    MAESTRO_CLI_NO_ANALYTICS: "1",
    MAESTRO_DISABLE_ANALYTICS: "1",
    MAESTRO_DEVICE_ID: serial,
  } as NodeJS.ProcessEnv;

  if (!process.env.JAVA_TOOL_OPTIONS) {
    delete env.JAVA_TOOL_OPTIONS;
  }

  const result = runCommandCapture(command[0], command.slice(1), {
    cwd: context.rootDir,
    env,
    timeoutMs: 10 * 60 * 1000,
  });
  const durationMs = Date.now() - startedAt;
  const stdout = `${result.stdout ?? ""}`;
  const stderr = `${result.stderr ?? ""}`;
  const timedOut = didCommandTimeout(result);
  const exitCode = timedOut ? null : result.status;
  const screenshotPath = readLatestPng(runtime.screenshotDir);
  const logPath = readLatestLog(runtime.logsDir);
  const failureCategory = exitCode === 0 ? null : timedOut ? "bootstrap" : classifyFailure(stdout, stderr);
  const message = exitCode === 0
    ? "Smoke completado correctamente."
    : timedOut
      ? "Maestro agotó el tiempo máximo permitido sin completar el smoke."
    : buildSmokeErrorMessage(failureCategory, stdout, stderr);

  return {
    ok: exitCode === 0,
    exitCode,
    stdout,
    stderr,
    durationMs,
    timedOut,
    command,
    screenshotPath,
    reportPath: null,
    logPath,
    failureCategory,
    message,
  };
}

export function persistMaestroSmokeResults(
  context: ValidationContext,
  runtime: MaestroRuntime,
  smokeResult: MaestroRunOutcome,
) {
  const canonicalScreenshot = runtime.screenshotFile;
  if (smokeResult.screenshotPath && smokeResult.screenshotPath !== canonicalScreenshot) {
    copyFile(smokeResult.screenshotPath, canonicalScreenshot);
  } else if (!fs.existsSync(canonicalScreenshot) && context.adbPath) {
    captureAdbScreenshot(context.adbPath, smokeResult.command.includes("--device") ? smokeResult.command[smokeResult.command.indexOf("--device") + 1] ?? "" : "", canonicalScreenshot);
  }

  pruneDirectoryKeepingFile(runtime.screenshotDir, canonicalScreenshot);

  const resultPayload = {
    ok: smokeResult.ok,
    exitCode: smokeResult.exitCode,
    durationMs: smokeResult.durationMs,
    timedOut: smokeResult.timedOut,
    failureCategory: smokeResult.failureCategory,
    message: smokeResult.message,
    screenshotPath: fs.existsSync(canonicalScreenshot) ? normalizeWindowsPath(canonicalScreenshot) : null,
    logPath: smokeResult.logPath ? normalizeWindowsPath(runtime.logPath) : null,
    reportPath: normalizeWindowsPath(runtime.reportJsonPath),
    appPackage: context.packageName,
    rootDir: normalizeWindowsPath(context.rootDir),
  };

  writeJsonFile(runtime.reportJsonPath, resultPayload);

  const lines = [
    "# Maestro Smoke Report",
    "",
    `- Result: ${smokeResult.ok ? "passed" : "failed"}`,
    `- Duration: ${Math.round(smokeResult.durationMs / 1000)}s`,
    `- Exit code: ${smokeResult.exitCode ?? "null"}`,
    `- Screenshot: ${normalizeWindowsPath(canonicalScreenshot)}`,
    `- Log: ${smokeResult.logPath ? normalizeWindowsPath(smokeResult.logPath) : "missing"}`,
    `- Category: ${smokeResult.failureCategory ?? "n/a"}`,
    "",
    "## Message",
    "",
    smokeResult.message,
  ];

  writeTextFile(runtime.reportMdPath, `${lines.join("\n")}\n`);

  if (smokeResult.logPath && fs.existsSync(smokeResult.logPath)) {
    const logTarget = runtime.logPath;
    if (smokeResult.logPath !== logTarget) {
      copyFile(smokeResult.logPath, logTarget);
    }
  }

  return {
    screenshotPath: canonicalScreenshot,
    reportJsonPath: runtime.reportJsonPath,
    reportMdPath: runtime.reportMdPath,
    logPath: runtime.logPath,
  };
}

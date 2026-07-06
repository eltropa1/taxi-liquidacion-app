import fs from "fs";
import path from "path";
import { spawn } from "child_process";

import {
  fileExists,
  normalizeWindowsPath,
  readJsonFile,
  runCommandCapture,
  sleep,
} from "./utils";

type AppJson = {
  expo?: {
    android?: {
      package?: string;
    };
  };
};

export type AndroidEnvironment = Readonly<{
  sdkRoot: string | null;
  adbPath: string | null;
  emulatorPath: string | null;
  avdNames: readonly string[];
  selectedAvdName: string | null;
  apkPath: string | null;
  packageName: string;
  mainActivity: string;
}>;

export type AndroidPreflightCheck = Readonly<{
  id: string;
  label: string;
  ok: boolean;
  required: boolean;
  message: string;
}>;

export type AndroidPreflightResult = Readonly<{
  ok: boolean;
  checks: readonly AndroidPreflightCheck[];
  avdNames: readonly string[];
  selectedAvdName: string | null;
  adbPath: string | null;
  emulatorPath: string | null;
  apkPath: string | null;
  packageName: string;
  mainActivity: string;
  sdkRoot: string | null;
}>;

export type AndroidRuntimeState = Readonly<{
  serial: string;
  avdName: string;
  bootCompleted: boolean;
  installed: boolean;
  launched: boolean;
}>;

function readAppPackageName(rootDir: string) {
  const appJsonPath = path.join(rootDir, "app.json");
  const appJson = readJsonFile<AppJson>(appJsonPath);
  return appJson.expo?.android?.package ?? "com.taxiliquidacionapp";
}

function resolveSdkRoot(rootDir: string) {
  const envRoot = process.env.ANDROID_SDK_ROOT?.trim() || process.env.ANDROID_HOME?.trim() || "";
  if (envRoot) {
    return path.resolve(envRoot);
  }

  const pathAdb = resolveFromPath("adb");
  if (pathAdb) {
    return path.resolve(path.dirname(path.dirname(pathAdb)));
  }

  return null;
}

function resolveFromPath(tool: "adb" | "emulator") {
  const whereResult = runCommandCapture(isWindowsName() ? "where.exe" : "which", [tool], {
    cwd: process.cwd(),
  });

  const resolved = (whereResult.stdout ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return resolved && fs.existsSync(resolved) ? resolved : null;
}

function resolveAdbFromPath() {
  return resolveFromPath("adb");
}

function resolveEmulatorFromPath() {
  return resolveFromPath("emulator");
}

function resolveToolFromSdk(sdkRoot: string | null, tool: "adb" | "emulator") {
  if (!sdkRoot) return null;

  const candidate =
    tool === "adb"
      ? path.join(sdkRoot, "platform-tools", isWindowsName() ? "adb.exe" : "adb")
      : path.join(sdkRoot, "emulator", isWindowsName() ? "emulator.exe" : "emulator");

  return fs.existsSync(candidate) ? candidate : null;
}

function isWindowsName() {
  return process.platform === "win32";
}

function resolveApkPath(rootDir: string) {
  const candidates = [
    path.join(rootDir, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk"),
    path.join(rootDir, "android", "app", "build", "outputs", "apk", "debug", "app-debug-unsigned.apk"),
    path.join(rootDir, "android", "app", "build", "outputs", "apk", "dev", "debug", "app-dev-debug.apk"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function parseAvdList(output: string) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function resolveAndroidEnvironment(rootDir: string): AndroidEnvironment {
  const sdkRoot = resolveSdkRoot(rootDir);
  const adbPath = resolveToolFromSdk(sdkRoot, "adb") ?? resolveAdbFromPath();
  const emulatorPath = resolveToolFromSdk(sdkRoot, "emulator") ?? resolveEmulatorFromPath();

  const avdNames = emulatorPath
    ? parseAvdList(
        runCommandCapture(emulatorPath, ["-list-avds"], { cwd: rootDir }).stdout ?? "",
      )
    : [];

  return {
    sdkRoot,
    adbPath,
    emulatorPath,
    avdNames,
    selectedAvdName: avdNames[0] ?? null,
    apkPath: resolveApkPath(rootDir),
    packageName: readAppPackageName(rootDir),
    mainActivity: ".MainActivity",
  };
}

export function buildAndroidPreflightChecks(environment: AndroidEnvironment) {
  const checks: AndroidPreflightCheck[] = [];

  checks.push({
    id: "sdk",
    label: "Android SDK",
    required: true,
    ok: environment.sdkRoot !== null,
    message: environment.sdkRoot
      ? `SDK detectado en ${normalizeWindowsPath(environment.sdkRoot)}`
      : "No se ha podido localizar Android SDK. Define ANDROID_SDK_ROOT o ANDROID_HOME.",
  });

  checks.push({
    id: "adb",
    label: "adb",
    required: true,
    ok: environment.adbPath !== null,
    message: environment.adbPath
      ? `adb detectado en ${normalizeWindowsPath(environment.adbPath)}`
      : "No se ha podido localizar adb. Revisa platform-tools o el PATH.",
  });

  checks.push({
    id: "emulator",
    label: "emulator",
    required: true,
    ok: environment.emulatorPath !== null,
    message: environment.emulatorPath
      ? `emulator detectado en ${normalizeWindowsPath(environment.emulatorPath)}`
      : "No se ha podido localizar emulator. Revisa el SDK de Android.",
  });

  checks.push({
    id: "avd",
    label: "AVD",
    required: true,
    ok: environment.avdNames.length > 0,
    message:
      environment.avdNames.length > 0
        ? `AVDs disponibles: ${environment.avdNames.join(", ")}`
        : "No hay AVDs disponibles. Crea uno manualmente en Android Studio.",
  });

  checks.push({
    id: "apk",
    label: "APK",
    required: true,
    ok: environment.apkPath !== null,
    message: environment.apkPath
      ? `APK disponible en ${normalizeWindowsPath(environment.apkPath)}`
      : "No se encontró un APK de desarrollo. Genera una build antes de validar.",
  });

  checks.push({
    id: "variables",
    label: "Variables",
    required: true,
    ok: Boolean(process.env.ANDROID_SDK_ROOT?.trim() || process.env.ANDROID_HOME?.trim()),
    message:
      process.env.ANDROID_SDK_ROOT?.trim() || process.env.ANDROID_HOME?.trim()
        ? "Variables Android principales detectadas."
        : "Falta ANDROID_SDK_ROOT o ANDROID_HOME. El runner puede derivar rutas, pero se recomienda definir una variable explícita.",
  });

  checks.push({
    id: "ports",
    label: "Puertos",
    required: false,
    ok: true,
    message: "No hay puertos bloqueantes en esta fase. Se comprobarán más adelante cuando exista Metro/Maestro.",
  });

  return checks;
}

export function runAndroidPreflight(rootDir: string): AndroidPreflightResult {
  const environment = resolveAndroidEnvironment(rootDir);
  const checks = buildAndroidPreflightChecks(environment);
  const ok = checks.every((check) => !check.required || check.ok);

  return {
    ok,
    checks,
    avdNames: environment.avdNames,
    selectedAvdName: environment.selectedAvdName,
    adbPath: environment.adbPath,
    emulatorPath: environment.emulatorPath,
    apkPath: environment.apkPath,
    packageName: environment.packageName,
    mainActivity: environment.mainActivity,
    sdkRoot: environment.sdkRoot,
  };
}

function readDevices(adbPath: string) {
  const result = runCommandCapture(adbPath, ["devices"]);
  const stdout = result.stdout ?? "";
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("emulator-"))
    .map((line) => line.split(/\s+/)[0])
    .filter(Boolean);
}

export function getRunningEmulatorSerial(adbPath: string) {
  return readDevices(adbPath)[0] ?? null;
}

export async function ensureEmulatorRunning(
  environment: AndroidEnvironment,
  options?: Readonly<{ timeoutMs?: number }>,
) {
  if (!environment.adbPath || !environment.emulatorPath) {
    throw new Error("No se puede arrancar el emulador porque faltan adb o emulator.");
  }

  const existingSerial = getRunningEmulatorSerial(environment.adbPath);
  if (existingSerial) {
    const bootCompleted = await waitForBootCompleted(environment.adbPath, existingSerial, {
      timeoutMs: options?.timeoutMs ?? 180000,
    });

    return {
      serial: existingSerial,
      avdName: environment.selectedAvdName ?? "running-emulator",
      bootCompleted,
    };
  }

  if (!environment.selectedAvdName) {
    throw new Error("No existe un AVD configurado para arrancar.");
  }

  const spawnResult = spawn(environment.emulatorPath, [
    "-avd",
    environment.selectedAvdName,
    "-no-boot-anim",
    "-no-snapshot-save",
    "-gpu",
    "swiftshader_indirect",
    "-no-window",
  ], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  spawnResult.unref();

  const serial = await waitForNewEmulatorSerial(environment.adbPath, {
    timeoutMs: options?.timeoutMs ?? 180000,
  });
  const bootCompleted = await waitForBootCompleted(environment.adbPath, serial, {
    timeoutMs: options?.timeoutMs ?? 180000,
  });

  return {
    serial,
    avdName: environment.selectedAvdName,
    bootCompleted,
  };
}

async function waitForNewEmulatorSerial(
  adbPath: string,
  options: Readonly<{ timeoutMs: number }>,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < options.timeoutMs) {
    const serial = getRunningEmulatorSerial(adbPath);
    if (serial) {
      return serial;
    }

    await sleep(2000);
  }

  throw new Error("El emulador no apareció en adb dentro del tiempo esperado.");
}

export async function waitForBootCompleted(
  adbPath: string,
  serial: string,
  options: Readonly<{ timeoutMs: number }>,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < options.timeoutMs) {
    const result = runCommandCapture(adbPath, ["-s", serial, "shell", "getprop", "sys.boot_completed"]);
    const bootValue = (result.stdout ?? "").trim();

    if (bootValue === "1") {
      return true;
    }

    await sleep(3000);
  }

  throw new Error(`El emulador ${serial} no completó el arranque a tiempo.`);
}

export function installApk(adbPath: string, serial: string, apkPath: string) {
  if (!fs.existsSync(apkPath)) {
    throw new Error(`No existe el APK esperado en ${apkPath}`);
  }

  const result = runCommandCapture(adbPath, ["-s", serial, "install", "-r", "-d", apkPath]);
  const stdout = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

  if (result.status !== 0 || !stdout.includes("Success")) {
    throw new Error(`No se pudo instalar la APK en ${serial}: ${stdout.trim()}`);
  }

  return true;
}

export async function launchApp(
  adbPath: string,
  serial: string,
  packageName: string,
  mainActivity: string,
) {
  const activityName = mainActivity.startsWith(".") ? `${packageName}/${mainActivity}` : `${packageName}/${mainActivity}`;
  const startResult = runCommandCapture(adbPath, [
    "-s",
    serial,
    "shell",
    "am",
    "start",
    "-W",
    "-n",
    activityName,
  ]);

  const launchOutput = `${startResult.stdout ?? ""}\n${startResult.stderr ?? ""}`;
  if (startResult.status !== 0) {
    throw new Error(`No se pudo lanzar la app: ${launchOutput.trim()}`);
  }

  if (
    !launchOutput.includes("Status: ok") ||
    !launchOutput.includes("Complete") ||
    !launchOutput.includes("Activity:")
  ) {
    throw new Error(`La app no confirmó el arranque esperado: ${launchOutput.trim()}`);
  }

  return launchOutput.trim();
}

export async function waitForAppVisibility(
  adbPath: string,
  serial: string,
  packageName: string,
  mainActivity: string,
  options: Readonly<{ timeoutMs: number }>,
) {
  const activityToken = mainActivity.startsWith(".")
    ? `${packageName}/${mainActivity}`
    : `${packageName}/${mainActivity}`;
  const startedAt = Date.now();

  while (Date.now() - startedAt < options.timeoutMs) {
    const focused = runCommandCapture(adbPath, [
      "-s",
      serial,
      "shell",
      "dumpsys",
      "window",
      "windows",
    ]);
    const focusedText = `${focused.stdout ?? ""}\n${focused.stderr ?? ""}`;

    const activityDump = runCommandCapture(adbPath, [
      "-s",
      serial,
      "shell",
      "dumpsys",
      "activity",
      "activities",
    ]);
    const activityText = `${activityDump.stdout ?? ""}\n${activityDump.stderr ?? ""}`;

    const pidResult = runCommandCapture(adbPath, ["-s", serial, "shell", "pidof", packageName]);
    const pidText = `${pidResult.stdout ?? ""}`.trim();

    if (
      pidText.length > 0 &&
      (
        focusedText.includes(packageName) ||
        focusedText.includes("MainActivity") ||
        activityText.includes(packageName) ||
        activityText.includes("MainActivity") ||
        activityText.includes(activityToken) ||
        activityText.includes("RESUMED")
      )
    ) {
      return true;
    }

    await sleep(2500);
  }

  throw new Error(`La app ${packageName} no quedó visible en el tiempo esperado.`);
}

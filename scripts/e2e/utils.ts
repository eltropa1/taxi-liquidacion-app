import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

export const repoRoot = path.resolve(__dirname, "../..");

export function isWindows() {
  return process.platform === "win32";
}

export function toBinPath(name: string) {
  return path.join(
    repoRoot,
    "node_modules",
    ".bin",
    isWindows() ? `${name}.cmd` : name,
  );
}

export function fileExists(filePath: string) {
  return fs.existsSync(filePath);
}

export function readTextFile(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(readTextFile(filePath)) as T;
}

export function ensureDirectory(directoryPath: string) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

export function removeDirectoryContents(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    return;
  }

  for (const entry of fs.readdirSync(directoryPath)) {
    fs.rmSync(path.join(directoryPath, entry), { recursive: true, force: true });
  }
}

export function writeTextFile(filePath: string, content: string) {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

export function writeJsonFile(filePath: string, value: unknown) {
  writeTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function copyFile(sourcePath: string, targetPath: string) {
  ensureDirectory(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

export function listFilesRecursive(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const entries: string[] = [];

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      entries.push(...listFilesRecursive(fullPath));
      continue;
    }

    entries.push(fullPath);
  }

  return entries;
}

export function runCommand(
  command: string,
  args: readonly string[],
  options?: Readonly<{
    cwd?: string;
    allowFailure?: boolean;
    env?: NodeJS.ProcessEnv;
    timeoutMs?: number;
  }>,
) {
  const resolved = isWindows() && command.toLowerCase().endsWith(".cmd")
    ? { command: "cmd.exe", args: ["/c", command, ...args] }
    : { command, args: [...args] };

  const result = spawnSync(resolved.command, resolved.args, {
    cwd: options?.cwd ?? repoRoot,
    env: options?.env ?? process.env,
    encoding: "utf8",
    shell: false,
    stdio: "inherit",
    timeout: options?.timeoutMs,
  });

  if (!options?.allowFailure && result.status !== 0) {
    const renderedArgs = args.map((arg) => JSON.stringify(arg)).join(" ");
    throw new Error(`Command failed: ${command} ${renderedArgs}`);
  }

  return result;
}

export function runCommandCapture(
  command: string,
  args: readonly string[],
  options?: Readonly<{
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    timeoutMs?: number;
  }>,
) {
  const resolved = isWindows() && command.toLowerCase().endsWith(".cmd")
    ? { command: "cmd.exe", args: ["/c", command, ...args] }
    : { command, args: [...args] };

  return spawnSync(resolved.command, resolved.args, {
    cwd: options?.cwd ?? repoRoot,
    env: options?.env ?? process.env,
    encoding: "utf8",
    shell: false,
    timeout: options?.timeoutMs,
  });
}

export function runCommandCaptureBuffer(
  command: string,
  args: readonly string[],
  options?: Readonly<{
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    timeoutMs?: number;
  }>,
) {
  const resolved = isWindows() && command.toLowerCase().endsWith(".cmd")
    ? { command: "cmd.exe", args: ["/c", command, ...args] }
    : { command, args: [...args] };

  return spawnSync(resolved.command, resolved.args, {
    cwd: options?.cwd ?? repoRoot,
    env: options?.env ?? process.env,
    encoding: "buffer",
    shell: false,
    timeout: options?.timeoutMs,
  });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeWindowsPath(value: string) {
  return value.replace(/\\/g, "/");
}

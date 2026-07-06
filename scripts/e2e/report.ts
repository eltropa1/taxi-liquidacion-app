import path from "path";

import {
  ensureDirectory,
  normalizeWindowsPath,
  writeJsonFile,
  writeTextFile,
} from "./utils";
import { ValidationContext, ValidationError, ValidationReport, ValidationResult, ValidationStep } from "./contracts";

export function buildValidationReport(
  context: ValidationContext,
  result: ValidationResult,
): ValidationReport {
  return {
    title: "TaxiGeo Validation Report",
    summary: result.ok ? "VALIDACIÓN APROBADA" : "VALIDACIÓN FALLIDA",
    context,
    result,
  };
}

export function formatValidationSummary(report: ValidationReport) {
  const lines: string[] = [];

  lines.push(report.summary);
  lines.push(`Mode: ${report.context.mode}`);
  lines.push(`Phase: ${report.result.phase}`);
  lines.push(`Duration: ${Math.round(report.result.durationMs / 1000)}s`);
  lines.push("");
  lines.push("Steps:");

  for (const step of report.result.steps) {
    lines.push(`- ${step.label}: ${step.status}${step.message ? ` (${step.message})` : ""}`);
  }

  if (report.result.errors.length > 0) {
    lines.push("");
    lines.push("Errors:");

    for (const error of report.result.errors) {
      lines.push(`- ${error.stepId}: ${error.message}`);
      for (const detail of error.details ?? []) {
        lines.push(`  - ${detail}`);
      }
    }
  }

  return lines;
}

export function buildValidationError(stepId: string, message: string, details?: readonly string[]): ValidationError {
  return { stepId, message, details };
}

export function createPendingStep(id: string, label: string): ValidationStep {
  return { id, label, status: "pending" };
}

export function persistValidationReport(report: ValidationReport, reportDir: string) {
  ensureDirectory(reportDir);

  const jsonPath = path.join(reportDir, "validation-summary.json");
  const mdPath = path.join(reportDir, "validation-summary.md");

  writeJsonFile(jsonPath, {
    title: report.title,
    summary: report.summary,
    context: {
      ...report.context,
      rootDir: normalizeWindowsPath(report.context.rootDir),
      androidSdkRoot: report.context.androidSdkRoot ? normalizeWindowsPath(report.context.androidSdkRoot) : null,
      adbPath: report.context.adbPath ? normalizeWindowsPath(report.context.adbPath) : null,
      emulatorPath: report.context.emulatorPath ? normalizeWindowsPath(report.context.emulatorPath) : null,
      apkPath: report.context.apkPath ? normalizeWindowsPath(report.context.apkPath) : null,
    },
    result: report.result,
  });

  const lines = [
    `# ${report.title}`,
    "",
    `- Summary: ${report.summary}`,
    `- Mode: ${report.context.mode}`,
    `- Phase: ${report.result.phase}`,
    `- Duration: ${Math.round(report.result.durationMs / 1000)}s`,
    "",
    "## Steps",
    "",
    ...report.result.steps.map((step) => `- ${step.label}: ${step.status}${step.message ? ` (${step.message})` : ""}`),
  ];

  if (report.result.errors.length > 0) {
    lines.push("", "## Errors", "");
    for (const error of report.result.errors) {
      lines.push(`- ${error.stepId}: ${error.message}`);
      for (const detail of error.details ?? []) {
        lines.push(`  - ${detail}`);
      }
    }
  }

  writeTextFile(mdPath, `${lines.join("\n")}\n`);

  return {
    jsonPath,
    mdPath,
  };
}

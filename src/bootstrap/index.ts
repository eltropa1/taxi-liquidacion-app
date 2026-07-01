import { createAppRuntime, type AppRuntime } from "./runtime/createAppRuntime";

let bootstrapPromise: Promise<AppRuntime> | null = null;

/**
 * Punto único de arranque oficial.
 *
 * Centraliza la creación del runtime y evita inicializaciones duplicadas.
 */
export function bootstrapApp(): Promise<AppRuntime> {
  if (!bootstrapPromise) {
    bootstrapPromise = createAppRuntime();
  }

  return bootstrapPromise;
}

export type { AppRuntime } from "./runtime/createAppRuntime";

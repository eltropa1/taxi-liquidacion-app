import { getApplicationPersistence } from "../ports/persistence";

/**
 * Caso de uso: abrir una jornada de trabajo.
 */
export class OpenWorkday {
  static async execute(): Promise<void> {
    const { workdayRepository } = getApplicationPersistence();
    await workdayRepository.openWorkday();
  }
}

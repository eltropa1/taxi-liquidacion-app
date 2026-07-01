import { getApplicationPersistence } from "../ports/persistence";

/**
 * Caso de uso: cerrar una jornada de trabajo.
 */
export class CloseWorkday {
  static async execute(): Promise<void> {
    const { workdayRepository } = getApplicationPersistence();
    await workdayRepository.closeCurrentWorkday();
  }
}

import { getApplicationPersistence } from "../ports/persistence";

/**
 * Caso de uso: cerrar una jornada de trabajo.
 */
export class CloseWorkday {
  static async execute(endOdometer?: number | null): Promise<void> {
    const { workdayRepository } = getApplicationPersistence();
    await workdayRepository.closeCurrentWorkday(endOdometer ?? null);
  }
}

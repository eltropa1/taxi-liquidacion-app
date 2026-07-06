import { getApplicationPersistence } from "../ports/persistence";

/**
 * Caso de uso: editar los odómetros de una jornada de trabajo.
 */
export class UpdateWorkday {
  static async execute(params: {
    id: number;
    startOdometer: number;
    endOdometer: number | null;
  }): Promise<void> {
    const { workdayRepository } = getApplicationPersistence();
    await workdayRepository.updateWorkdayOdometers(params);
  }
}

import { getApplicationPersistence } from "../ports/persistence";

/**
 * Caso de uso: abrir una jornada de trabajo.
 */
export class OpenWorkday {
  static async execute(startOdometer: number): Promise<void> {
    const { workdayRepository } = getApplicationPersistence();

    const previousWorkday = await workdayRepository.getMostRecentWorkday();
    if (previousWorkday && previousWorkday.endOdometer === null) {
      await workdayRepository.setEndOdometerIfMissing({
        id: previousWorkday.id,
        endOdometer: startOdometer,
      });
    }

    await workdayRepository.openWorkday(startOdometer);
  }
}

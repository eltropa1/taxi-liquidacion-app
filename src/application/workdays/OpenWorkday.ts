import { getApplicationPersistence } from "../ports/persistence";

/**
 * Caso de uso: abrir una jornada de trabajo.
 */
export class OpenWorkday {
  static async execute(startOdometer: number): Promise<void> {
    const { workdayRepository } = getApplicationPersistence();

    const previousWorkday = await workdayRepository.getMostRecentWorkday();
    if (previousWorkday && !previousWorkday.isClosed) {
      throw new Error(
        "Ya tienes una jornada abierta desde el " +
          new Date(previousWorkday.startTime).toLocaleDateString() +
          ". Debes cerrarla antes de abrir una nueva.",
      );
    }

    if (previousWorkday && previousWorkday.endOdometer === null) {
      await workdayRepository.setEndOdometerIfMissing({
        id: previousWorkday.id,
        endOdometer: startOdometer,
      });
    }

    await workdayRepository.openWorkday(startOdometer);
  }
}

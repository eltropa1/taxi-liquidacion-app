import { getApplicationPersistence } from "../ports/persistence";
import { GoalService } from "../runtime";

/**
 * Caso de uso: cerrar una jornada de trabajo.
 */
export class CloseWorkday {
  static async execute(endOdometer?: number | null): Promise<void> {
    const { workdayRepository } = getApplicationPersistence();
    const currentGoalPolicy = await GoalService.getCurrentGoalPolicy();
    await workdayRepository.closeCurrentWorkday(
      endOdometer ?? null,
      currentGoalPolicy?.id ?? null,
    );
  }
}

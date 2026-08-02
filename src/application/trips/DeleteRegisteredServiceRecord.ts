import { getApplicationPersistence } from "../ports/persistence";
import { ClosedWorkdayEditConfirmationRequiredError } from "./ClosedWorkdayEditConfirmationRequiredError";

export type DeleteRegisteredServiceRecordOptions = Readonly<{
  confirmedClosedWorkdayEdit?: boolean;
}>;

export type DeleteRegisteredServiceRecordResult = Readonly<{
  voided: true;
}>;

export class DeleteRegisteredServiceRecord {
  static async execute(
    id: number,
    options: DeleteRegisteredServiceRecordOptions = {},
  ): Promise<DeleteRegisteredServiceRecordResult> {
    const { tripRepository, workdayRepository } = getApplicationPersistence();
    const trip = await tripRepository.findTripById(id);

    if (!trip) {
      throw new Error("Servicio registrado no encontrado");
    }

    if (trip.serviceStatus !== "completed") {
      throw new Error("Solo se puede anular un servicio registrado");
    }

    const workday = trip.workdayId
      ? await workdayRepository.getWorkdayById(trip.workdayId)
      : null;
    const editingClosedWorkday = Boolean(workday?.isClosed);

    if (editingClosedWorkday && !options.confirmedClosedWorkdayEdit && workday) {
      throw new ClosedWorkdayEditConfirmationRequiredError({
        workdayId: workday.id,
        workdayStartTime: workday.startTime,
      });
    }

    const voidedAt = new Date();
    await tripRepository.runInTransaction(async () => {
      await tripRepository.voidTrip(id, voidedAt);

      if (editingClosedWorkday) {
        await tripRepository.stampClosedWorkdayEdit(id, voidedAt);
      }
    });

    return { voided: true };
  }
}

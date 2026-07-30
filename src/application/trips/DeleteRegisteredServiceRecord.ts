import { getApplicationPersistence } from "../ports/persistence";

export type DeleteRegisteredServiceRecordResult = Readonly<{
  voided: true;
}>;

export class DeleteRegisteredServiceRecord {
  static async execute(id: number): Promise<DeleteRegisteredServiceRecordResult> {
    const { tripRepository } = getApplicationPersistence();
    const trip = await tripRepository.findTripById(id);

    if (!trip) {
      throw new Error("Servicio registrado no encontrado");
    }

    if (trip.serviceStatus !== "completed") {
      throw new Error("Solo se puede anular un servicio registrado");
    }

    await tripRepository.voidTrip(id, new Date());

    return { voided: true };
  }
}

import { getApplicationPersistence } from "../ports/persistence";

export class DeleteTrip {
  static async execute(id: number): Promise<void> {
    const { tripRepository } = getApplicationPersistence();
    await tripRepository.deleteTrip(id);
  }
}

import { PaymentType, TripSource } from "../../constants/enums";
import { getApplicationPersistence } from "../ports/persistence";

export class CreateManualTrip {
  static async execute(params: {
    startTime: Date;
    endTime: Date;
    amount: number;
    payment: PaymentType;
    source: TripSource;
  }) {
    const { tripRepository, workdayRepository } = getApplicationPersistence();

    const workday = await workdayRepository.getWorkdayForDate(params.startTime);
    if (!workday) {
      throw new Error("No existe día de trabajo para esa fecha");
    }

    await tripRepository.createManualTrip({
      startTime: params.startTime,
      endTime: params.endTime,
      amount: params.amount,
      payment: params.payment,
      source: params.source,
      workdayId: workday.id,
      createdAt: new Date(),
    });
  }
}

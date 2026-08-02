import { PaymentType, TripSource } from "../../constants/enums";
import { getApplicationPersistence } from "../ports/persistence";
import { ClosedWorkdayEditConfirmationRequiredError } from "./ClosedWorkdayEditConfirmationRequiredError";

export type CreateManualTripOptions = Readonly<{
  confirmedClosedWorkdayEdit?: boolean;
}>;

export class CreateManualTrip {
  static async execute(
    params: {
      startTime: Date;
      endTime: Date;
      amount: number;
      payment: PaymentType;
      source: TripSource;
    },
    options: CreateManualTripOptions = {},
  ) {
    const { tripRepository, workdayRepository } = getApplicationPersistence();

    const workday = await workdayRepository.getWorkdayForDate(params.startTime);
    if (!workday) {
      throw new Error("No existe día de trabajo para esa fecha");
    }

    const workdayDetail = await workdayRepository.getWorkdayById(workday.id);
    const isClosedWorkday = Boolean(workdayDetail?.isClosed);

    if (isClosedWorkday && !options.confirmedClosedWorkdayEdit && workdayDetail) {
      throw new ClosedWorkdayEditConfirmationRequiredError({
        workdayId: workdayDetail.id,
        workdayStartTime: workdayDetail.startTime,
      });
    }

    await tripRepository.runInTransaction(async () => {
      const result = await tripRepository.createManualTrip({
        startTime: params.startTime,
        endTime: params.endTime,
        amount: params.amount,
        payment: params.payment,
        source: params.source,
        workdayId: workday.id,
        createdAt: new Date(),
      });

      if (isClosedWorkday) {
        await tripRepository.stampClosedWorkdayEdit(result.id, new Date());
      }
    });
  }
}

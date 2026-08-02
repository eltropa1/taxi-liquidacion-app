import { PaymentType, TripSource } from "../../constants/enums";
import { getApplicationPersistence } from "../ports/persistence";
import { ClosedWorkdayEditConfirmationRequiredError } from "./ClosedWorkdayEditConfirmationRequiredError";

export type UpdateTripOptions = Readonly<{
  confirmedClosedWorkdayEdit?: boolean;
}>;

export class UpdateTrip {
  static async execute(
    id: number,
    amount: number,
    payment: PaymentType,
    source: TripSource,
    customSource?: string,
    chargedAmount?: number,
    cashTip?: number,
    serviceStatus?: "incomplete" | "completed",
    options: UpdateTripOptions = {},
  ): Promise<void> {
    const { tripRepository, workdayRepository } = getApplicationPersistence();

    const current = await tripRepository.findTripById(id);
    const workday = current?.workdayId
      ? await workdayRepository.getWorkdayById(current.workdayId)
      : null;
    const editingClosedWorkday = Boolean(workday?.isClosed);

    if (editingClosedWorkday && !options.confirmedClosedWorkdayEdit && workday) {
      throw new ClosedWorkdayEditConfirmationRequiredError({
        workdayId: workday.id,
        workdayStartTime: workday.startTime,
      });
    }

    await tripRepository.runInTransaction(async () => {
      await tripRepository.updateTrip({
        id,
        amount,
        payment,
        source,
        customSource: customSource ?? null,
        chargedAmount: chargedAmount ?? null,
        cashTip: cashTip ?? null,
        serviceStatus,
      });

      if (editingClosedWorkday) {
        await tripRepository.stampClosedWorkdayEdit(id, new Date());
      }
    });
  }

  static async updateTimes(
    id: number,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    const { tripRepository } = getApplicationPersistence();

    await tripRepository.updateTripTimes({
      id,
      startTime,
      endTime,
    });
  }

  static async updateManualZones(
    id: number,
    pickupZone: string | null,
    dropoffZone: string | null,
  ): Promise<void> {
    const { tripRepository } = getApplicationPersistence();

    await tripRepository.updateTripManualZones({
      id,
      pickupZone,
      dropoffZone,
    });
  }

  static async updateEditedTrip(params: {
    id: number;
    amount: number;
    payment: PaymentType;
    source: TripSource;
    startTime: Date;
    endTime: Date;
    manualPickupZone: string | null;
    manualDropoffZone: string | null;
    customSource?: string;
    chargedAmount?: number;
    cashTip?: number;
  }): Promise<void> {
    const { tripRepository } = getApplicationPersistence();

    await tripRepository.runInTransaction(async () => {
      await tripRepository.updateEditedTrip({
        id: params.id,
        amount: params.amount,
        payment: params.payment,
        source: params.source,
        startTime: params.startTime,
        endTime: params.endTime,
        manualPickupZone: params.manualPickupZone,
        manualDropoffZone: params.manualDropoffZone,
        customSource: params.customSource ?? null,
        chargedAmount: params.chargedAmount ?? null,
        cashTip: params.cashTip ?? null,
      });
    });
  }
}

import { PaymentType, TripSource } from "../../constants/enums";
import {
  getApplicationPersistence,
  type TripPersistenceRecord,
} from "../ports/persistence";
import { ClosedWorkdayEditConfirmationRequiredError } from "./ClosedWorkdayEditConfirmationRequiredError";

export type CorrectRegisteredServiceCommand = Readonly<{
  id: number;
  amount: number;
  payment: PaymentType;
  chargedAmount: number | null;
  cashTip: number | null;
  source: TripSource;
  customSource: string | null;
  startTime: Date;
  endTime: Date;
  manualPickupZone: string | null;
  manualDropoffZone: string | null;
}>;

export type CorrectRegisteredServiceOptions = Readonly<{
  confirmedClosedWorkdayEdit?: boolean;
}>;

export type CorrectRegisteredServiceResult =
  | Readonly<{ status: "updated" }>
  | Readonly<{ status: "unchanged" }>;

export class CorrectRegisteredService {
  static async execute(
    command: CorrectRegisteredServiceCommand,
    options: CorrectRegisteredServiceOptions = {},
  ): Promise<CorrectRegisteredServiceResult> {
    const { tripRepository, workdayRepository } = getApplicationPersistence();
    const current = await tripRepository.findTripById(command.id);

    if (!current) {
      throw new Error("Servicio registrado no encontrado");
    }

    if (current.serviceStatus !== "completed") {
      throw new Error("Solo se puede corregir un servicio registrado");
    }

    if (isUnchanged(current, command)) {
      return { status: "unchanged" };
    }

    const workday = current.workdayId
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
      await tripRepository.updateEditedTrip({
        id: command.id,
        amount: command.amount,
        payment: command.payment,
        source: command.source,
        customSource: command.customSource,
        chargedAmount: command.chargedAmount,
        cashTip: command.cashTip,
        startTime: command.startTime,
        endTime: command.endTime,
        manualPickupZone: command.manualPickupZone,
        manualDropoffZone: command.manualDropoffZone,
        serviceStatus: "completed",
      });

      if (editingClosedWorkday) {
        await tripRepository.stampClosedWorkdayEdit(command.id, new Date());
      }
    });

    return { status: "updated" };
  }
}

function isUnchanged(
  current: TripPersistenceRecord,
  command: CorrectRegisteredServiceCommand,
) {
  return (
    current.endTime !== null &&
    current.amount === command.amount &&
    current.payment === command.payment &&
    current.chargedAmount === command.chargedAmount &&
    current.cashTip === command.cashTip &&
    current.source === command.source &&
    (current.customSource ?? null) === (command.customSource ?? null) &&
    new Date(current.startTime).toISOString() === command.startTime.toISOString() &&
    new Date(current.endTime).toISOString() === command.endTime.toISOString() &&
    (current.manualPickupZone ?? null) === (command.manualPickupZone ?? null) &&
    (current.manualDropoffZone ?? null) === (command.manualDropoffZone ?? null)
  );
}

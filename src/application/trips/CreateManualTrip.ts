import { PaymentType, TripSource } from "../../constants/enums";
import { getDatabase } from "../../database/database";
import { WorkdayService } from "../../services/WorkdayService";

export class CreateManualTrip {
  static async execute(params: {
    startTime: Date;
    endTime: Date;
    amount: number;
    payment: PaymentType;
    source: TripSource;
  }) {
    const db = await getDatabase();

    const workday = await WorkdayService.getWorkdayForDate(params.startTime);
    if (!workday) {
      throw new Error("No existe día de trabajo para esa fecha");
    }

    await db.runAsync(
      `
    INSERT INTO trips (
      startTime,
      endTime,
      amount,
      payment,
      source,
      createdAt,
      workdayId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        params.startTime.toISOString(),
        params.endTime.toISOString(),
        params.amount,
        params.payment,
        params.source,
        new Date().toISOString(),
        workday.id,
      ],
    );
  }
}

import { PaymentType, TripSource } from "../../constants/enums";
import { getDatabase } from "../../database/database";

export class UpdateTrip {
  static async execute(
    id: number,
    amount: number,
    payment: PaymentType,
    source: TripSource,
    customSource?: string,
    chargedAmount?: number,
    cashTip?: number,
  ): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      `
      UPDATE trips
      SET amount = ?, payment = ?, source = ?, customSource = ?, chargedAmount = ?, cashTip = ?
      WHERE id = ?
      `,
      [
        amount,
        payment,
        source,
        customSource ?? null,
        chargedAmount ?? null,
        cashTip ?? null,
        id,
      ],
    );
  }

  static async updateTimes(
    id: number,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      `
    UPDATE trips
    SET startTime = ?, endTime = ?
    WHERE id = ?
    `,
      [startTime.toISOString(), endTime.toISOString(), id],
    );
  }

  static async updateManualZones(
    id: number,
    pickupZone: string | null,
    dropoffZone: string | null,
  ): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      `
    UPDATE trips
    SET manualPickupZone = ?, manualDropoffZone = ?
    WHERE id = ?
    `,
      [pickupZone, dropoffZone, id],
    );
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
    await this.updateManualZones(
      params.id,
      params.manualPickupZone,
      params.manualDropoffZone,
    );

    await this.updateTimes(params.id, params.startTime, params.endTime);

    await this.execute(
      params.id,
      params.amount,
      params.payment,
      params.source,
      params.customSource,
      params.chargedAmount,
      params.cashTip,
    );
  }
}

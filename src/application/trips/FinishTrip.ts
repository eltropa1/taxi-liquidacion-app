import { PaymentType, TripSource } from "../../constants/enums";
import { getDatabase } from "../../database/database";
import { TripGeoSnapshotRepository } from "../../database/repositories/TripGeoSnapshotRepository";
import { GeoLocationFactory } from "../../geo-location";
import { GeoAdministrativeResolver } from "../../geo/geocoding/engine";

const geoLocationService = GeoLocationFactory.create();

/**
 * Caso de uso: finalizar un viaje.
 *
 * Mantiene la secuencia histórica exacta para no alterar comportamiento.
 */
export class FinishTrip {
  static async execute(
    amount: number,
    payment: PaymentType,
    source: TripSource,
    customSource?: string,
    chargedAmount?: number,
    cashTip?: number,
  ): Promise<void> {
    const db = await getDatabase();

    const active = await db.getFirstAsync<{ id: number }>(
      `
      SELECT id
      FROM trips
      WHERE endTime IS NULL
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );

    if (!active) return;

    const endTime = new Date().toISOString();

    // Importe realmente cobrado
    const finalChargedAmount =
      payment === PaymentType.CARD && typeof chargedAmount === "number"
        ? chargedAmount
        : amount;

    // 1️⃣ Cerrar viaje
    await db.runAsync(
      `
      UPDATE trips
      SET endTime = ?, amount = ?, chargedAmount = ?, cashTip = ?, payment = ?, source = ?, customSource = ?
      WHERE id = ?
      `,
      [
        endTime,
        amount,
        finalChargedAmount,
        cashTip ?? null,
        payment,
        source,
        customSource ?? null,
        active.id,
      ],
    );

    // 2️⃣ GPS real
    const location = await geoLocationService.getCurrentLocation();

    // 3️⃣ Resolver snapshot administrativo
    const geoSnapshot = GeoAdministrativeResolver.resolve(
      location.latitude,
      location.longitude,
    );

    // 4️⃣ Guardar snapshot END
    await TripGeoSnapshotRepository.insert({
      tripId: active.id,
      kind: "END",
      snapshot: geoSnapshot,
      createdAt: new Date().toISOString(),
    });
  }
}

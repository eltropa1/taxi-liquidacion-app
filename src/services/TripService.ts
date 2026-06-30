import { PaymentType, TripSource } from "../constants/enums";
import { TripGeoSnapshotRepository } from "../database/repositories/TripGeoSnapshotRepository";
import { Trip } from "../domain/trips/canonical";
import { TripQueryService } from "./TripQueryService";

/**
 * Fachada temporal del dominio de viajes.
 *
 * Mantiene compatibilidad con consumidores heredados mientras la
 * lectura canónica del aggregate se introduce de forma progresiva.
 */
export class TripService {
  /**
   * Devuelve un viaje por ID.
   * Usado exclusivamente para edición.
   */
  static async getTripById(id: number): Promise<{
    id: number;
    startTime: string;
    endTime: string | null;
    amount: number | null;
    payment: PaymentType | null;
    source: TripSource;
    customSource: string | null;
    chargedAmount: number | null;
    cashTip: number | null;
    manualPickupZone: string | null;
    manualDropoffZone: string | null;
  } | null> {
    return TripQueryService.getTripById(id);
  }

  /**
   * Devuelve el aggregate canónico de un viaje por ID.
   */
  static async getCanonicalTripById(id: number): Promise<Trip | null> {
    return TripQueryService.getCanonicalTripById(id);
  }

  /**
   * Devuelve los snapshots GEO de un viaje.
   * Usado exclusivamente para edición.
   */
  static async getTripGeoSnapshots(tripId: number) {
    return TripGeoSnapshotRepository.getSnapshotsForTrip(tripId);
  }
}

import { PaymentType, TripSource } from "../constants/enums";
import { TripQueryService } from "./TripQueryService";

/**
 * Servicio de viajes.
 * Contiene TODA la lógica de negocio histórica
 * + integración GEO sin romper nada existente.
 */
export class TripService {
  // ===================================================
  // VIAJES
  // ===================================================

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
}

/**
 * TripGeoSnapshot
 * ----------------
 * Snapshot técnico de geolocalización asociado a un viaje.
 *
 * Representa una captura puntual de GPS en un momento concreto
 * del ciclo de vida del viaje (inicio o fin).
 *
 * NO contiene lógica.
 * NO evalúa zonas.
 * NO conoce el dominio del taxi.
 */
export interface TripGeoSnapshot {
  /**
   * Identificador único del snapshot
   */
  id?: number;

  /**
   * Viaje al que pertenece el snapshot
   */
  tripId: number;

  /**
   * Tipo de snapshot (inicio o fin)
   */
  type: "START" | "END";

  /**
   * Coordenadas GPS
   */
  latitude: number;
  longitude: number;

  /**
   * Timestamp exacto de la medición
   */
  timestamp: string;

  /**
   * Zona GEO evaluada a partir de este snapshot
   * (dato derivado, puede ser null)
   */
  zoneId?: string | null;

  /**
   * Fecha de creación del snapshot
   * (auditoría)
   */
  createdAt: string;
}

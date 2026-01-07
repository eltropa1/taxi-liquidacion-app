import { GeoContext, GeoZone } from "../models";
import { GeoZoneEvaluator } from "../engine";

/**
 * GeoDomainService
 * ----------------
 * Servicio de dominio que coordina:
 * - Catálogo de zonas
 * - Motor de evaluación
 *
 * Es el punto de entrada del BLOQUE GEO
 * para el resto de la aplicación.
 */
export class GeoDomainService {
  constructor(
    private readonly zones: GeoZone[],
    private readonly zoneEvaluator: GeoZoneEvaluator
  ) {}

  /**
   * Devuelve todas las zonas en las que
   * el contexto actual encaja.
   */
  findMatchingZones(context: GeoContext): GeoZone[] {
    return this.zones.filter((zone) =>
      this.zoneEvaluator.evaluate(zone, context)
    );
  }

  /**
   * Devuelve la primera zona coincidente
   * (orden del catálogo = prioridad)
   */
  findFirstMatchingZone(context: GeoContext): GeoZone | null {
    for (const zone of this.zones) {
      if (this.zoneEvaluator.evaluate(zone, context)) {
        return zone;
      }
    }
    return null;
  }
}

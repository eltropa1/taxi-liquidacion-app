import { zonesCatalog } from "./catalog";
import { GeoZoneEvaluator } from "./engine";
import { CircleRuleEvaluator } from "./engine";
import { GeoDomainService } from "./domain";

/**
 * GeoServiceFactory
 * -----------------
 * Punto único de creación del servicio GEO.
 *
 * IMPORTANTE:
 * - No se ejecuta automáticamente
 * - No se importa en UI
 * - No contiene lógica de negocio
 */
export class GeoServiceFactory {
  /**
   * Crea una instancia completamente configurada
   * del GeoDomainService.
   */
  static create(): GeoDomainService {
    const ruleEvaluators = [
      new CircleRuleEvaluator(),
      // futuros evaluadores aquí
    ];

    const zoneEvaluator = new GeoZoneEvaluator(ruleEvaluators);

    return new GeoDomainService(zonesCatalog, zoneEvaluator);
  }
}

import { GeoContext, GeoRule } from "../../models";
import { GeoRuleEvaluator } from "../GeoRuleEvaluator";

/**
 * CircleRuleEvaluator
 * -------------------
 * Evalúa reglas de tipo CIRCLE.
 *
 * Payload esperado:
 * {
 *   center: { latitude, longitude },
 *   radiusMeters: number
 * }
 */
export class CircleRuleEvaluator implements GeoRuleEvaluator {
  readonly supportedType = "CIRCLE";

  evaluate(rule: GeoRule, context: GeoContext): boolean {
    const { center, radiusMeters } = rule.payload as {
      center: { latitude: number; longitude: number };
      radiusMeters: number;
    };

    const distance = this.calculateDistanceMeters(
      context.point.latitude,
      context.point.longitude,
      center.latitude,
      center.longitude
    );

    /**
 * Se añade una tolerancia para evitar errores
 * por precisión de coma flotante en cálculos GPS.
 */
const EPSILON = 0.0001; // 10 cm aprox

return distance <= radiusMeters + EPSILON;

  }

  /**
   * Calcula distancia entre dos puntos geográficos
   * usando la fórmula de Haversine.
   */
  private calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // radio tierra en metros
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

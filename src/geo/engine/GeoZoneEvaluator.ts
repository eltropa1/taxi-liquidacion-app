import { GeoContext, GeoZone } from "../models";
import { GeoRuleEvaluator } from "./GeoRuleEvaluator";

/**
 * GeoZoneEvaluator
 * ----------------
 * Evalúa si un contexto pertenece a una zona
 * evaluando TODAS sus reglas.
 */
export class GeoZoneEvaluator {
  private readonly evaluatorByType: Map<string, GeoRuleEvaluator>;

  constructor(ruleEvaluators: GeoRuleEvaluator[]) {
    this.evaluatorByType = new Map();

    for (const evaluator of ruleEvaluators) {
      this.evaluatorByType.set(evaluator.supportedType, evaluator);
    }
  }


  /**
   * Devuelve true si TODAS las reglas de la zona se cumplen
   */
 evaluate(zone: GeoZone, context: GeoContext): boolean {
  // ❌ Zona sin reglas: inválida
  if (!zone.rules || zone.rules.length === 0) {
    return false;
  }

  // ✅ TODAS las reglas deben cumplirse (AND estricto)
  for (const rule of zone.rules) {
    const evaluator = this.evaluatorByType.get(rule.type);


    // ❌ Regla desconocida → zona inválida
    if (!evaluator) {
      return false;
    }

    const isValid = evaluator.evaluate(rule, context);

    // ❌ Si una regla falla → toda la zona falla
    if (!isValid) {
      return false;
    }
  }

  // ✅ Todas las reglas han pasado
  return true;
}
}

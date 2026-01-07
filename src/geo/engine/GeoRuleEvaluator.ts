import { GeoContext, GeoRule } from "../models";

/**
 * GeoRuleEvaluator
 * ----------------
 * Contrato que deben cumplir todos los evaluadores
 * de reglas geográficas.
 */
export interface GeoRuleEvaluator {
  /**
   * Tipo de regla que este evaluador soporta
   */
  readonly supportedType: string;

  /**
   * Evalúa si el contexto cumple la regla
   */
  evaluate(rule: GeoRule, context: GeoContext): boolean;
}

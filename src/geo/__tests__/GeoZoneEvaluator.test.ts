import { GeoZoneEvaluator } from "../engine/GeoZoneEvaluator";
import { CircleRuleEvaluator } from "../engine/ruleEvaluators/CircleRuleEvaluator";
import { GeoContext, GeoRule, GeoZone } from "../models";

/**
 * Payload tipado para reglas CIRCLE (solo tests)
 */
type CircleRulePayload = {
  center: {
    latitude: number;
    longitude: number;
  };
  radiusMeters: number;
};

/**
 * Helper: crea una regla CIRCLE válida
 */
function createCircleRule(
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): GeoRule {
  const payload: CircleRulePayload = {
    center: {
      latitude: centerLat,
      longitude: centerLng,
    },
    radiusMeters,
  };

  return {
    type: "CIRCLE",
    payload,
  };
}

/**
 * Helper: crea contexto GEO
 */
function createContext(
  latitude: number,
  longitude: number
): GeoContext {
  return {
    point: { latitude, longitude },
    timestamp: new Date(),
  };
}

/**
 * Helper: crea GeoZoneEvaluator exactamente
 * como lo espera el constructor real
 */
function createZoneEvaluator(): GeoZoneEvaluator {
  return new GeoZoneEvaluator([
    new CircleRuleEvaluator(),
  ]);
}

describe("GeoZoneEvaluator", () => {
  const evaluator = createZoneEvaluator();

  test("zona con una única regla válida devuelve true", () => {
    const zone: GeoZone = {
      id: "ZONE_OK",
      name: "Zona válida",
      rules: [
        createCircleRule(40.4168, -3.7038, 1000),
      ],
    };

    const context = createContext(40.4170, -3.7035);

    expect(evaluator.evaluate(zone, context)).toBe(true);
  });

  test("zona con una única regla no válida devuelve false", () => {
    const zone: GeoZone = {
      id: "ZONE_FAIL",
      name: "Zona inválida",
      rules: [
        createCircleRule(40.4168, -3.7038, 300),
      ],
    };

    const context = createContext(40.4300, -3.7000);

    expect(evaluator.evaluate(zone, context)).toBe(false);
  });

  test("zona con múltiples reglas funciona como AND", () => {
    const zone: GeoZone = {
      id: "ZONE_AND_OK",
      name: "Zona AND correcta",
      rules: [
        createCircleRule(40.4168, -3.7038, 2000),
        createCircleRule(40.4168, -3.7038, 1500),
      ],
    };

    const context = createContext(40.4170, -3.7035);

    expect(evaluator.evaluate(zone, context)).toBe(true);
  });

  test("si una de las reglas falla, la zona NO es válida", () => {
    const zone: GeoZone = {
      id: "ZONE_AND_FAIL",
      name: "Zona AND fallida",
      rules: [
        createCircleRule(40.4168, -3.7038, 2000),
        createCircleRule(40.4168, -3.7038, 50),
      ],
    };

    const context = createContext(40.4200, -3.7000);

    expect(evaluator.evaluate(zone, context)).toBe(false);
  });

  test("una regla desconocida invalida la zona (fail-safe)", () => {
    const zone: GeoZone = {
      id: "ZONE_UNKNOWN",
      name: "Zona con regla desconocida",
      rules: [
        {
          type: "UNKNOWN_RULE",
          payload: {},
        },
      ],
    };

    const context = createContext(40.4168, -3.7038);

    expect(evaluator.evaluate(zone, context)).toBe(false);
  });

  test("una zona sin reglas nunca es válida", () => {
    const zone: GeoZone = {
      id: "ZONE_EMPTY",
      name: "Zona vacía",
      rules: [],
    };

    const context = createContext(40.4168, -3.7038);

    expect(evaluator.evaluate(zone, context)).toBe(false);
  });
});

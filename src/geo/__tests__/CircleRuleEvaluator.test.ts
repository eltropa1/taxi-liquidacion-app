import { CircleRuleEvaluator } from "../engine/ruleEvaluators";
import { GeoContext, GeoRule } from "../models";


type CircleRulePayload = {
  center: {
    latitude: number;
    longitude: number;
  };
  radiusMeters: number;
};


/**
 * Desplaza una coordenada en latitud exactamente X metros hacia el norte.
 * Aproximación suficiente para tests.
 */
function moveNorth(
  latitude: number,
  meters: number
): number {
  const metersPerDegree = 111_320; // promedio
  return latitude + meters / metersPerDegree;
}


describe("CircleRuleEvaluator", () => {
  const evaluator = new CircleRuleEvaluator();

  const rule: GeoRule = {
  type: "CIRCLE",
  payload: {
    center: {
      latitude: 40.4168,
      longitude: -3.7038,
    },
    radiusMeters: 1000,
  } as CircleRulePayload,
};


  test("punto dentro del radio devuelve true", () => {
    const context: GeoContext = {
      point: {
        latitude: 40.4170,
        longitude: -3.7035,
      },
      timestamp: new Date(),
    };

    expect(evaluator.evaluate(rule, context)).toBe(true);
  });

  test("punto fuera del radio devuelve false", () => {
    const context: GeoContext = {
      point: {
        latitude: 40.4300,
        longitude: -3.7000,
      },
      timestamp: new Date(),
    };

    expect(evaluator.evaluate(rule, context)).toBe(false);
  });

  test("punto exactamente en el borde devuelve true", () => {
  const payload = rule.payload as CircleRulePayload;

const borderLatitude = moveNorth(
  payload.center.latitude,
  payload.radiusMeters
);


  const context: GeoContext = {
    point: {
      latitude: borderLatitude,
      longitude: payload.center.longitude,
    },
    timestamp: new Date(),
  };

  expect(evaluator.evaluate(rule, context)).toBe(true);
});

});

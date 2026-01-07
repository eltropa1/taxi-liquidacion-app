import { GeoZone } from "../models";

/**
 * zonesCatalog
 * ------------
 * Catálogo central de zonas geográficas de la aplicación.
 *
 * IMPORTANTE:
 * - Este fichero es 100% declarativo
 * - No contiene lógica
 * - No evalúa reglas
 * - No importa motores ni helpers
 *
 * El motor de evaluación será el encargado
 * de interpretar estas definiciones.
 */
export const zonesCatalog: GeoZone[] = [
  /**
   * ============================
   * EJEMPLO DE ZONA (PLACEHOLDER)
   * ============================
   *
   * Zona ficticia usada como ejemplo estructural.
   * NO representa reglas reales todavía.
   */
  {
    id: "EXAMPLE_ZONE",
    name: "Zona de ejemplo (no productiva)",
    rules: [
      {
        type: "CIRCLE",
        payload: {
          /**
           * Centro del círculo
           * (valores ficticios)
           */
          center: {
            latitude: 40.000000,
            longitude: -3.000000,
          },

          /**
           * Radio en metros
           */
          radiusMeters: 500,
        },
      },
    ],
  },
];

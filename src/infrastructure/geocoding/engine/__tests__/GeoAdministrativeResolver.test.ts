import { GeoAdministrativeResolver } from "../GeoAdministrativeResolver";

/**
 * Coordenadas de referencia verificadas (Wikipedia / fuentes GPS) para
 * cada zona especial. Si una de estas aserciones falla, o bien se ha
 * movido/reducido la caja del catálogo, o bien ha vuelto a romperse el
 * emparejamiento GeoPolygon/GeoMultiPolygon en isPointInPolygon.
 */
describe("GeoAdministrativeResolver - zonas especiales", () => {
  it.each([
    ["MAD_AIRPORT_T1_T2_T3", 40.4661, -3.5704],
    ["MAD_AIRPORT_T4", 40.4917613, -3.5935537],
    ["MAD_CHAMARTIN", 40.472101, -3.6826857],
    ["MAD_ATOCHA", 40.4065, -3.6893],
    ["MAD_IFEMA", 40.46778, -3.61722],
    ["MAD_NUEVOS_MINISTERIOS", 40.4466221, -3.6924595],
    ["MAD_PRINCIPE_PIO", 40.4210681, -3.7203687],
    ["MAD_HOSPITAL_LA_PAZ", 40.48093, -3.68736],
    ["MAD_HOSPITAL_GREGORIO_MARANON", 40.41948, -3.67124],
    ["MAD_HOSPITAL_12_OCTUBRE", 40.37622, -3.69848],
    ["MAD_HOSPITAL_RAMON_Y_CAJAL", 40.487208, -3.693883],
  ])("resuelve %s en su coordenada real", (expectedZoneId, lat, lng) => {
    const result = GeoAdministrativeResolver.resolve(lat, lng);
    expect(result.specialZone?.id).toBe(expectedZoneId);
  });

  it("no asigna zona especial a un punto fuera de todas las cajas", () => {
    const result = GeoAdministrativeResolver.resolve(40.4169, -3.7035); // Sol
    expect(result.specialZone).toBeUndefined();
    expect(result.neighborhood?.id).toBe("016");
    expect(result.district?.id).toBe("01");
  });

  it("resuelve barrio y distrito para un punto de referencia conocido", () => {
    const result = GeoAdministrativeResolver.resolve(40.472101, -3.6826857); // Chamartín
    expect(result.neighborhood?.name).toBe("Castilla");
    expect(result.district?.name).toBe("Chamartín");
  });

  /**
   * Regresión directa del bug histórico: isPointInPolygon distinguía
   * GeoPolygon de GeoMultiPolygon mirando solo `geometry[0][0]`, que es
   * SIEMPRE un array en ambos formatos (una coordenada en un GeoPolygon,
   * un anillo completo en un GeoMultiPolygon). Como las zonas especiales
   * se definen como GeoPolygon simple (una única caja, sin envolver en
   * un nivel extra de polígono), nunca coincidían con ningún punto real,
   * pese a que las coordenadas fueran correctas. Este test falla si
   * alguien reintroduce esa comprobación superficial.
   */
  it("detecta zonas especiales en formato GeoPolygon simple (no envuelto como multipolígono)", () => {
    const insideT4 = GeoAdministrativeResolver.resolve(40.49, -3.59);
    expect(insideT4.specialZone?.id).toBe("MAD_AIRPORT_T4");
  });
});

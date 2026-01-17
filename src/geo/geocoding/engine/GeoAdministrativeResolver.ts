import {
  GeoAddressSnapshot,
  GeoAdministrativeType,
  GeoAdministrativeUnit,
} from "../models";

import {
  NEIGHBORHOODS_GEO,
  NeighborhoodFeature,
  DISTRICTS_GEO,
  DistrictFeature,
} from "../base";

import {
  SPECIAL_ZONES_CATALOG,
} from "../catalog";

/**
 * GeoAdministrativeResolver
 * -------------------------
 * Resuelve barrio, distrito y zonas especiales
 * a partir de coordenadas GPS.
 *
 * - No usa APIs externas
 * - No pregunta al usuario
 * - Determinista
 */
export class GeoAdministrativeResolver {
  /**
   * Resuelve un snapshot administrativo completo
   */
  static resolve(
    latitude: number,
    longitude: number
  ): GeoAddressSnapshot {
    const resolvedAt = new Date().toISOString();

    //esto es un test quitar luego
 console.log("📍 GEO POINT:", latitude, longitude);
//el test termina aqui

    // 1️⃣ ZONAS ESPECIALES (prioridad alta)
    const specialZone = this.resolveSpecialZone(latitude, longitude);

    // 2️⃣ BARRIO
    const neighborhood = this.resolveNeighborhood(latitude, longitude);

    // 3️⃣ DISTRITO
    const district = neighborhood
      ? this.resolveDistrictById(neighborhood.districtId)
      : this.resolveDistrict(latitude, longitude);

    const snapshot: GeoAddressSnapshot = {
  resolvedAt,
  latitude,
  longitude,
};

if (district) {
  snapshot.district = {
    id: district.id,
    name: district.name,
  };
}

if (neighborhood) {
  snapshot.neighborhood = {
    id: neighborhood.id,
    name: neighborhood.name,
  };
}

if (specialZone) {
  snapshot.specialZone = {
    id: specialZone.id,
    name: specialZone.name,
    type: GeoAdministrativeType.SPECIAL_ZONE,
  };
}

return snapshot;
  
  }

  // ======================
  // RESOLVERS INTERNOS
  // ======================

  private static resolveNeighborhood(
    lat: number,
    lng: number
  ): NeighborhoodFeature | null {

    //esto es temporal es un test
    console.log("🏘️ TOTAL NEIGHBORHOODS:", NEIGHBORHOODS_GEO.length);
    //el test termina aqui

    for (const feature of NEIGHBORHOODS_GEO) {
      const inside = this.isPointInPolygon(lat, lng, feature.geometry);

  if (inside) {

      //esto es solo temporal es un test
    console.log("✅ MATCH NEIGHBORHOOD:", feature.id);
    //hasta aqui

    return feature;
  }
      
    }
    return null;
  }

  private static resolveDistrict(
    lat: number,
    lng: number
  ): DistrictFeature | null {
    for (const feature of DISTRICTS_GEO) {
      if (this.isPointInPolygon(lat, lng, feature.geometry)) {
        return feature;
      }
    }
    return null;
  }

  private static resolveDistrictById(
    id: string
  ): DistrictFeature | null {
    return DISTRICTS_GEO.find((d) => d.id === id) ?? null;
  }

  /**
   * Zonas especiales se resuelven por GEO Zones
   * (motor GEO ya blindado)
   */
  private static resolveSpecialZone(
    _lat: number,
    _lng: number
  ) : GeoAdministrativeUnit | null {
    // ⚠️ Placeholder:
    // aquí se conectará con el motor GEO
    // (GeoZoneEvaluator + zonas especiales)
    return null;
  }

  // ======================
  // GEOMETRÍA
  // ======================

  /**
   * Ray-casting algorithm
   * Determina si un punto está dentro de un polígono.
   */
  private static isPointInPolygon(
    lat: number,
    lng: number,
    polygon: number[][][]
  ): boolean {
    let inside = false;

    for (const ring of polygon) {
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0];
        const yi = ring[i][1];
        const xj = ring[j][0];
        const yj = ring[j][1];

        const intersect =
  (yi > lat) !== (yj > lat) &&
  lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
      }
    }

    return inside;
  }
}

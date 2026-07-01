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
  GeoPolygon,
} from "../base";

import { SPECIAL_ZONES_CATALOG } from "../catalog";

import { GeoMultiPolygon } from "../base";

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
  static resolve(latitude: number, longitude: number): GeoAddressSnapshot {
    const resolvedAt = new Date().toISOString();

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
    lng: number,
  ): NeighborhoodFeature | null {
    for (const feature of NEIGHBORHOODS_GEO) {
      const inside = this.isPointInPolygon(lat, lng, feature.geometry);

      if (inside) {
        return feature;
      }
    }

    return null;
  }

  private static resolveDistrict(
    lat: number,
    lng: number,
  ): DistrictFeature | null {
    for (const feature of DISTRICTS_GEO) {
      if (this.isPointInPolygon(lat, lng, feature.geometry)) {
        return feature;
      }
    }
    return null;
  }

  private static resolveDistrictById(id: string): DistrictFeature | null {
    return DISTRICTS_GEO.find((d) => d.id === id) ?? null;
  }

  /**
   * Zonas especiales se resuelven por GEO Zones
   * (motor GEO ya blindado)
   */
private static resolveSpecialZone(
  lat: number,
  lng: number
): GeoAdministrativeUnit | null {
  for (const zone of SPECIAL_ZONES_CATALOG) {
    if (this.isPointInPolygon(lat, lng, zone.geometry)) {
      return zone;
    }
  }

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
  geometry: GeoPolygon | GeoMultiPolygon,
): boolean {
  const multipolygon: GeoMultiPolygon = Array.isArray(geometry[0][0])
    ? (geometry as GeoMultiPolygon)
    : ([geometry] as GeoMultiPolygon);

    const px = lng;
    const py = lat;

    for (const polygon of multipolygon) {
      if (polygon.length === 0) continue;

      // 1️⃣ Anillo exterior
      if (!this.isPointInRing(px, py, polygon[0])) {
        continue; // fuera del polígono
      }

      // 2️⃣ Anillos interiores (agujeros)
      let insideHole = false;
      for (let i = 1; i < polygon.length; i++) {
        if (this.isPointInRing(px, py, polygon[i])) {
          insideHole = true;
          break;
        }
      }

      if (!insideHole) {
        return true; // dentro del polígono válido
      }
    }

    return false;
  }
  private static isPointInRing(
    px: number,
    py: number,
    ring: [number, number][],
  ): boolean {
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];

      const intersect =
        yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }
}

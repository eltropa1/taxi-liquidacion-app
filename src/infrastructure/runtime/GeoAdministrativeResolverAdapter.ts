import type { GeoAdministrativeResolverPort } from "../../application/ports/runtime";
import { GeoAdministrativeResolver } from "../geocoding/engine";

export class GeoAdministrativeResolverAdapter implements GeoAdministrativeResolverPort {
  resolve(latitude: number, longitude: number) {
    return GeoAdministrativeResolver.resolve(latitude, longitude);
  }
}

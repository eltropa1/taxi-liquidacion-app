export type GeoLocationFix = Readonly<{
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}>;

export type GeoAddressSnapshot = Readonly<{
  resolvedAt: string;
  latitude: number;
  longitude: number;
  neighborhood?: Readonly<{
    id: string;
    name: string;
  }>;
  district?: Readonly<{
    id: string;
    name: string;
  }>;
  specialZone?: Readonly<{
    id: string;
    name: string;
    type: string;
  }>;
  /**
   * Municipio de la Comunidad de Madrid. Solo se resuelve cuando el
   * punto cae fuera de la capital (es decir, cuando `neighborhood` y
   * `district` no se han resuelto) — dentro de la capital, el barrio y
   * el distrito ya dan el nivel de detalle equivalente.
   */
  municipality?: Readonly<{
    id: string;
    name: string;
  }>;
}>;

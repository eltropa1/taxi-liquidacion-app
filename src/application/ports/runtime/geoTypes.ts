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
}>;

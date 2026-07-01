import type {
  GoalStoragePort,
  GeoAdministrativeResolverPort,
  GeoLocationPort,
  TripCsvExporterPort,
} from "../ports/runtime";

export type ApplicationRuntime = Readonly<{
  goalStorage: GoalStoragePort;
  geoLocation: GeoLocationPort;
  geoAdministrativeResolver: GeoAdministrativeResolverPort;
  tripCsvExporter: TripCsvExporterPort;
}>;

let currentApplicationRuntime: ApplicationRuntime | null = null;

export function configureApplicationRuntime(
  runtime: ApplicationRuntime,
): void {
  currentApplicationRuntime = runtime;
}

export function getApplicationRuntime(): ApplicationRuntime {
  if (!currentApplicationRuntime) {
    throw new Error("Application runtime has not been configured");
  }

  return currentApplicationRuntime;
}

export function resetApplicationRuntime(): void {
  currentApplicationRuntime = null;
}

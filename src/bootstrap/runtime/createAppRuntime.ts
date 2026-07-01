import { initializePersistence } from "../persistence/initializePersistence";
import {
  createPersistenceDependencies,
  type PersistenceDependencies,
} from "../persistence/createPersistenceDependencies";
import { configureApplicationPersistence } from "../../application/ports/persistence";
import {
  configureApplicationRuntime,
  type ApplicationRuntime,
} from "../../application/runtime";
import {
  AsyncStorageGoalStorage,
  ExpoGeoLocationPort,
  ExpoTripCsvExporter,
  GeoAdministrativeResolverAdapter,
} from "../../infrastructure/runtime";

export type AppRuntime = Readonly<{
  initializedAt: string;
  persistence: PersistenceDependencies;
  application: ApplicationRuntime;
}>;

/**
 * Crea el runtime oficial de la app.
 *
 * La composición actual solo necesita asegurar que la persistencia
 * está lista y devolver un runtime estable para futuras ampliaciones.
 */
export async function createAppRuntime(): Promise<AppRuntime> {
  const database = await initializePersistence();
  const persistence = await createPersistenceDependencies(database);
  configureApplicationPersistence(persistence);

  const application: ApplicationRuntime = Object.freeze({
    goalStorage: new AsyncStorageGoalStorage(),
    geoLocation: new ExpoGeoLocationPort(),
    geoAdministrativeResolver: new GeoAdministrativeResolverAdapter(),
    tripCsvExporter: new ExpoTripCsvExporter(),
  });

  configureApplicationRuntime(application);

  return Object.freeze({
    initializedAt: new Date().toISOString(),
    persistence,
    application,
  });
}

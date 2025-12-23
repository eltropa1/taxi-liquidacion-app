import * as SQLite from 'expo-sqlite';

/**
 * Abre (o crea) la base de datos SQLite usando la API moderna.
 * Esta API SÍ está soportada por Expo actualmente.
 */
export async function getDatabase() {
  return await SQLite.openDatabaseAsync('taxi_liquidation.db');
}

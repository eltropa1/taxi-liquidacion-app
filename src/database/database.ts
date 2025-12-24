import * as SQLite from "expo-sqlite";

/**
 * Instancia única de la base de datos SQLite.
 * IMPORTANTE:
 * - Se abre una sola vez
 * - Siempre con el mismo nombre
 * - Usamos la API moderna de Expo SDK 54
 */
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Devuelve la base de datos SQLite (singleton).
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (db) {
    return db;
  }

  // ⚠️ API correcta en Expo SDK 54
  db = SQLite.openDatabaseSync("taxi_liquidation.db");

  return db;
}

import * as SQLite from "expo-sqlite";

/**
 * En Fast Refresh, Metro re-ejecuta este módulo y reiniciaría un `let`
 * module-level, pero la conexión nativa SQLite previa sigue viva. Sin
 * este anclaje a `globalThis` se abriría una segunda conexión al mismo
 * fichero en cada recarga, y ambas competirían por el lock de escritura
 * ("database is locked"). `globalThis` sobrevive a la recarga de JS.
 */
declare global {
  // eslint-disable-next-line no-var
  var __taxiLiquidacionDatabase: SQLite.SQLiteDatabase | undefined;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!globalThis.__taxiLiquidacionDatabase) {
    globalThis.__taxiLiquidacionDatabase =
      SQLite.openDatabaseSync("taxi_liquidation.db");
  }

  return globalThis.__taxiLiquidacionDatabase;
}

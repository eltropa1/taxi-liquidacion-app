import * as SQLite from "expo-sqlite";

let database: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (database) {
    return database;
  }

  database = SQLite.openDatabaseSync("taxi_liquidation.db");
  return database;
}

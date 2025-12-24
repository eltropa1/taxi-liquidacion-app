import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { getDatabase } from "../database/database";

/**
 * Servicio de exportación de datos (MVP estable).
 *
 * Usamos explícitamente la API legacy de expo-file-system
 * porque en SDK 54 la API moderna bloquea writeAsStringAsync
 * en runtime.
 *
 * Esta es la forma RECOMENDADA por Expo para proyectos
 * que aún no migran a File/Directory.
 */
export class ExportService {
  static async exportTripsToCSV(): Promise<void> {
    const db = await getDatabase();

    const trips = await db.getAllAsync<{
      startTime: string;
      endTime: string | null;
      amount: number | null;
      payment: string | null;
      source: string;
    }>(`
      SELECT startTime, endTime, amount, payment, source
      FROM trips
      ORDER BY startTime ASC
    `);

    let csv = "fecha_inicio,hora_inicio,hora_fin,importe,pago,tipo\n";

    for (const t of trips) {
      const start = new Date(t.startTime);
      const end = t.endTime ? new Date(t.endTime) : null;

      csv += `${start.toLocaleDateString()},${start.toLocaleTimeString()},${
        end ? end.toLocaleTimeString() : ""
      },${t.amount ?? ""},${t.payment ?? ""},${t.source}\n`;
    }

    const fileUri =
      FileSystem.cacheDirectory + "viajes_taxi.csv";

    await FileSystem.writeAsStringAsync(fileUri, csv);

    await Sharing.shareAsync(fileUri);
  }
}

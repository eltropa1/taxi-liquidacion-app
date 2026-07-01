import { getApplicationPersistence } from "../ports/persistence";
import { getApplicationRuntime } from "./applicationRuntime";

export class ExportService {
  static async exportTripsToCSV(): Promise<void> {
    const trips = await getApplicationPersistence().tripRepository.findAllTripsForExport();

    let csv = "fecha_inicio,hora_inicio,hora_fin,importe,pago,tipo\n";

    for (const trip of trips) {
      const start = new Date(trip.startTime);
      const end = trip.endTime ? new Date(trip.endTime) : null;

      csv += `${start.toLocaleDateString()},${start.toLocaleTimeString()},${
        end ? end.toLocaleTimeString() : ""
      },${trip.amount ?? ""},${trip.payment ?? ""},${trip.source}\n`;
    }

    await getApplicationRuntime().tripCsvExporter.exportCsv(csv);
  }
}

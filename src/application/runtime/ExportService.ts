import { getApplicationPersistence } from "../ports/persistence";
import { getApplicationRuntime } from "./applicationRuntime";
import type { HistoricalDataset } from "../history";
import { buildHistoricalExportCsv } from "./historicalExportCsv";

export type HistoricalDatasetExportOutcome = Readonly<
  | {
      status: "empty";
      fileName: string;
      recordCount: 0;
    }
  | {
      status: "exported";
      fileName: string;
      recordCount: number;
    }
>;

export class ExportService {
  static async exportTripsToCSV(): Promise<void> {
    const trips = await getApplicationPersistence().tripRepository.findAllTripsForExport();
    await this.exportTripsToCSVRecords(trips);
  }

  static async exportWorkdayTripsToCSV(workdayId: number): Promise<void> {
    const trips = await getApplicationPersistence().tripRepository.findTripsForWorkday(
      workdayId,
    );

    await this.exportTripsToCSVRecords(trips);
  }

  static async exportHistoricalDatasetToCSV(
    dataset: HistoricalDataset,
  ): Promise<HistoricalDatasetExportOutcome> {
    if (dataset.records.length === 0) {
      const { fileName } = buildHistoricalExportCsv(dataset);

      return {
        status: "empty",
        fileName,
        recordCount: 0,
      };
    }

    const { csv, fileName, recordCount } = buildHistoricalExportCsv(dataset);
    await getApplicationRuntime().tripCsvExporter.exportCsv(csv, fileName);

    return {
      status: "exported",
      fileName,
      recordCount,
    };
  }

  private static async exportTripsToCSVRecords(
    trips: readonly {
      startTime: string;
      endTime: string | null;
      amount: number | null;
      payment: string | null;
      source: string;
    }[],
  ): Promise<void> {
    const orderedTrips = [...trips].sort(
      (left, right) =>
        new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
    );

    let csv = "fecha_inicio,hora_inicio,hora_fin,importe,pago,tipo\n";

    for (const trip of orderedTrips) {
      const start = new Date(trip.startTime);
      const end = trip.endTime ? new Date(trip.endTime) : null;

      csv += `${start.toLocaleDateString()},${start.toLocaleTimeString()},${
        end ? end.toLocaleTimeString() : ""
      },${trip.amount ?? ""},${trip.payment ?? ""},${trip.source}\n`;
    }

    await getApplicationRuntime().tripCsvExporter.exportCsv(csv);
  }
}

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { TripCsvExporterPort } from "../../application/ports/runtime";

export class ExpoTripCsvExporter implements TripCsvExporterPort {
  async exportCsv(csv: string): Promise<void> {
    const fileUri = `${FileSystem.cacheDirectory}viajes_taxi.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv);
    await Sharing.shareAsync(fileUri);
  }
}

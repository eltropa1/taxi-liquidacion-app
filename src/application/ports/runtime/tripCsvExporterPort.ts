export interface TripCsvExporterPort {
  exportCsv(csv: string): Promise<void>;
}

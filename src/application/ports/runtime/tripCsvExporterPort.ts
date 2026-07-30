export interface TripCsvExporterPort {
  exportCsv(csv: string, fileName?: string): Promise<void>;
}

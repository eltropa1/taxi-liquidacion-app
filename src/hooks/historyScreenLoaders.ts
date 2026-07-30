import { HistoricalQueryService } from "../application/history";
import type { HistoricalPeriodSelection } from "../application/history";

export type HistoryScreenData = Awaited<
  ReturnType<typeof HistoricalQueryService.getHistoricalDataset>
>;

export async function loadHistoryScreenData(
  selection: HistoricalPeriodSelection,
): Promise<HistoryScreenData> {
  return HistoricalQueryService.getHistoricalDataset(selection);
}

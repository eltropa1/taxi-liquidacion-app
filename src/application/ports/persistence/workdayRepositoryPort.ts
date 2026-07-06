export type WorkdayRecord = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  startOdometer: number | null;
  endOdometer: number | null;
  isClosed: boolean;
  createdAt: string;
}>;

export type WorkdayLookupRecord = Readonly<{
  id: number;
  startTime: string;
  startOdometer: number | null;
}>;

export type WorkdayInfoRecord = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  startOdometer: number | null;
  endOdometer: number | null;
  isClosed: boolean;
}>;

export interface WorkdayRepositoryPort {
  getOpenWorkday(): Promise<WorkdayLookupRecord | null>;

  openWorkdayIfNeeded(): Promise<WorkdayLookupRecord | null>;

  getMostRecentWorkday(): Promise<WorkdayRecord | null>;

  openWorkday(startOdometer: number): Promise<WorkdayRecord | null>;

  closeCurrentWorkday(endOdometer?: number | null): Promise<void>;

  updateWorkdayOdometers(params: {
    id: number;
    startOdometer: number;
    endOdometer: number | null;
  }): Promise<void>;

  setEndOdometerIfMissing(params: {
    id: number;
    endOdometer: number;
  }): Promise<void>;

  getWorkdayForDate(date: Date): Promise<WorkdayLookupRecord | null>;

  getWorkdayInfoForDate(date: Date): Promise<WorkdayInfoRecord | null>;

  findWorkdayIdsBetweenDates(
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ id: number }>>;

  assignTripToCurrentWorkday(tripId: number): Promise<void>;
}

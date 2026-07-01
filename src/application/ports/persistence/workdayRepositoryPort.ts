export type WorkdayRecord = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  isClosed: boolean;
  createdAt: string;
}>;

export type WorkdayLookupRecord = Readonly<{
  id: number;
  startTime: string;
}>;

export type WorkdayInfoRecord = Readonly<{
  id: number;
  startTime: string;
  endTime: string | null;
  isClosed: boolean;
}>;

export interface WorkdayRepositoryPort {
  getOpenWorkday(): Promise<WorkdayLookupRecord | null>;

  openWorkdayIfNeeded(): Promise<WorkdayLookupRecord | null>;

  openWorkday(): Promise<WorkdayRecord | null>;

  closeCurrentWorkday(): Promise<void>;

  getWorkdayForDate(date: Date): Promise<WorkdayLookupRecord | null>;

  getWorkdayInfoForDate(date: Date): Promise<WorkdayInfoRecord | null>;

  findWorkdayIdsBetweenDates(
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ id: number }>>;

  assignTripToCurrentWorkday(tripId: number): Promise<void>;
}

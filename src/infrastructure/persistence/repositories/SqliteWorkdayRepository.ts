import type { WorkdayRepositoryPort } from "../../../application/ports/persistence";
import type { PersistenceDatabase } from "../database";

type WorkdayRow = {
  id: number;
  startTime: string;
  endTime: string | null;
  isClosed: number;
  createdAt: string;
};

export class SqliteWorkdayRepository implements WorkdayRepositoryPort {
  constructor(private readonly database: PersistenceDatabase) {}

  async getOpenWorkday(): Promise<{ id: number; startTime: string } | null> {
    return this.database.getFirstAsync(
      `
      SELECT id, startTime
      FROM workdays
      WHERE isClosed = 0
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );
  }

  async openWorkdayIfNeeded(): Promise<{ id: number; startTime: string } | null> {
    const openDay = await this.getOpenWorkday();
    if (openDay) {
      return openDay;
    }

    await this.openWorkday();

    return this.getOpenWorkday();
  }

  async openWorkday(): Promise<{
    id: number;
    startTime: string;
    endTime: string | null;
    isClosed: boolean;
    createdAt: string;
  } | null> {
    const now = new Date().toISOString();

    const result = await this.database.runAsync(
      `
      INSERT INTO workdays (startTime, createdAt)
      VALUES (?, ?)
      `,
      [now, now],
    );

    const insertedId = Number(result.lastInsertRowId ?? 0);
    return this.database.getFirstAsync<{
      id: number;
      startTime: string;
      endTime: string | null;
      isClosed: boolean;
      createdAt: string;
    }>(
      `
      SELECT id, startTime, endTime, isClosed, createdAt
      FROM workdays
      WHERE id = ?
      `,
      [insertedId],
    );
  }

  async closeCurrentWorkday(): Promise<void> {
    const now = new Date().toISOString();

    await this.database.runAsync(
      `
      UPDATE workdays
      SET endTime = ?, isClosed = 1
      WHERE isClosed = 0
      `,
      [now],
    );
  }

  async getWorkdayForDate(
    date: Date,
  ): Promise<{ id: number; startTime: string } | null> {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      const active = await this.getOpenWorkday();
      if (active) return active;
    }

    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
    ).toISOString();

    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
    ).toISOString();

    return this.database.getFirstAsync(
      `
      SELECT id, startTime
      FROM workdays
      WHERE startTime BETWEEN ? AND ?
      ORDER BY startTime DESC
      LIMIT 1
      `,
      [startOfDay, endOfDay],
    );
  }

  async getWorkdayInfoForDate(
    date: Date,
  ): Promise<{
    id: number;
    startTime: string;
    endTime: string | null;
    isClosed: boolean;
  } | null> {
    const dayStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
    ).toISOString();

    const dayEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
    ).toISOString();

    const row = await this.database.getFirstAsync<WorkdayRow>(
      `
      SELECT id, startTime, endTime, isClosed, createdAt
      FROM workdays
      WHERE startTime BETWEEN ? AND ?
      ORDER BY startTime ASC
      LIMIT 1
      `,
      [dayStart, dayEnd],
    );

    return row
      ? {
          id: row.id,
          startTime: row.startTime,
          endTime: row.endTime,
          isClosed: row.isClosed === 1,
        }
      : null;
  }

  async findWorkdayIdsBetweenDates(
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ id: number }>> {
    const format = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    return this.database.getAllAsync<{ id: number }>(
      `
      SELECT id
      FROM workdays
      WHERE substr(startTime, 1, 10) BETWEEN ? AND ?
      ORDER BY startTime ASC
      `,
      [format(startDate), format(endDate)],
    );
  }

  async assignTripToCurrentWorkday(tripId: number): Promise<void> {
    const workday = await this.openWorkdayIfNeeded();
    if (!workday) {
      return;
    }

    await this.database.runAsync(
      `
      UPDATE trips
      SET workdayId = ?
      WHERE id = ?
      `,
      [workday.id, tripId],
    );
  }
}

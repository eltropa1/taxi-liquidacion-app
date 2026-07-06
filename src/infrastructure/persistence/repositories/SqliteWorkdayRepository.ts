import type { WorkdayRepositoryPort } from "../../../application/ports/persistence";
import type { PersistenceDatabase } from "../database";

type WorkdayRow = {
  id: number;
  startTime: string;
  endTime: string | null;
  startOdometer: number | null;
  endOdometer: number | null;
  isClosed: number;
  createdAt: string;
};

export class SqliteWorkdayRepository implements WorkdayRepositoryPort {
  constructor(private readonly database: PersistenceDatabase) {}

  async getOpenWorkday(): Promise<{
    id: number;
    startTime: string;
    startOdometer: number | null;
  } | null> {
    return this.database.getFirstAsync(
      `
      SELECT id, startTime, startOdometer
      FROM workdays
      WHERE isClosed = 0
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );
  }

  async openWorkdayIfNeeded(): Promise<{
    id: number;
    startTime: string;
    startOdometer: number | null;
  } | null> {
    return this.getOpenWorkday();
  }

  async getMostRecentWorkday(): Promise<{
    id: number;
    startTime: string;
    endTime: string | null;
    startOdometer: number | null;
    endOdometer: number | null;
    isClosed: boolean;
    createdAt: string;
  } | null> {
    return this.database.getFirstAsync<{
      id: number;
      startTime: string;
      endTime: string | null;
      startOdometer: number | null;
      endOdometer: number | null;
      isClosed: boolean;
      createdAt: string;
    }>(
      `
      SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt
      FROM workdays
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );
  }

  async openWorkday(startOdometer: number): Promise<{
    id: number;
    startTime: string;
    endTime: string | null;
    startOdometer: number | null;
    endOdometer: number | null;
    isClosed: boolean;
    createdAt: string;
  } | null> {
    const now = new Date().toISOString();

    const result = await this.database.runAsync(
      `
      INSERT INTO workdays (startTime, startOdometer, endOdometer, createdAt)
      VALUES (?, ?, NULL, ?)
      `,
      [now, startOdometer, now],
    );

    const insertedId = Number(result.lastInsertRowId ?? 0);
    return this.database.getFirstAsync<{
      id: number;
      startTime: string;
      endTime: string | null;
      startOdometer: number | null;
      endOdometer: number | null;
      isClosed: boolean;
      createdAt: string;
    }>(
      `
      SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt
      FROM workdays
      WHERE id = ?
      `,
      [insertedId],
    );
  }

  async closeCurrentWorkday(endOdometer?: number | null): Promise<void> {
    const now = new Date().toISOString();

    if (typeof endOdometer === "number") {
      await this.database.runAsync(
        `
        UPDATE workdays
        SET endTime = ?, endOdometer = ?, isClosed = 1
        WHERE isClosed = 0
        `,
        [now, endOdometer],
      );
      return;
    }

    await this.database.runAsync(
      `
      UPDATE workdays
      SET endTime = ?, isClosed = 1
      WHERE isClosed = 0
      `,
      [now],
    );
  }

  async updateWorkdayOdometers(params: {
    id: number;
    startOdometer: number;
    endOdometer: number | null;
  }): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE workdays
      SET startOdometer = ?, endOdometer = ?
      WHERE id = ?
      `,
      [params.startOdometer, params.endOdometer, params.id],
    );
  }

  async setEndOdometerIfMissing(params: {
    id: number;
    endOdometer: number;
  }): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE workdays
      SET endOdometer = ?
      WHERE id = ? AND endOdometer IS NULL
      `,
      [params.endOdometer, params.id],
    );
  }

  async getWorkdayForDate(
    date: Date,
  ): Promise<{ id: number; startTime: string; startOdometer: number | null } | null> {
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
      SELECT id, startTime, startOdometer
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
    startOdometer: number | null;
    endOdometer: number | null;
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
      SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt
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
          startOdometer: row.startOdometer,
          endOdometer: row.endOdometer,
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
    const workday = await this.getOpenWorkday();
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

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
  goalPolicyId: string | null;
};

function mapWorkdayRow(row: WorkdayRow) {
  return {
    id: row.id,
    startTime: row.startTime,
    endTime: row.endTime,
    startOdometer: row.startOdometer,
    endOdometer: row.endOdometer,
    isClosed: row.isClosed === 1,
    createdAt: row.createdAt,
    ...(row.goalPolicyId ? { goalPolicyId: row.goalPolicyId } : {}),
  };
}

function startOfLocalDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

function endOfLocalDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

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
    goalPolicyId?: string | null;
  } | null> {
    return this.database.getFirstAsync<{
      id: number;
      startTime: string;
      endTime: string | null;
      startOdometer: number | null;
      endOdometer: number | null;
      isClosed: boolean;
      createdAt: string;
      goalPolicyId?: string | null;
    }>(
      `
      SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt, goalPolicyId
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
    goalPolicyId?: string | null;
  } | null> {
    const now = new Date().toISOString();

    const result = await this.database.runAsync(
      `
      INSERT INTO workdays (startTime, startOdometer, endOdometer, createdAt, goalPolicyId)
      VALUES (?, ?, NULL, ?, NULL)
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
      goalPolicyId?: string | null;
    }>(
      `
      SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt, goalPolicyId
      FROM workdays
      WHERE id = ?
      `,
      [insertedId],
    );
  }

  async closeCurrentWorkday(
    endOdometer?: number | null,
    goalPolicyId?: string | null,
  ): Promise<void> {
    const now = new Date().toISOString();
    const resolvedGoalPolicyId = goalPolicyId ?? null;

    if (typeof endOdometer === "number") {
      await this.database.runAsync(
        `
        UPDATE workdays
        SET endTime = ?, endOdometer = ?, goalPolicyId = ?, isClosed = 1
        WHERE isClosed = 0
        `,
        [now, endOdometer, resolvedGoalPolicyId],
      );
      return;
    }

    await this.database.runAsync(
      `
      UPDATE workdays
      SET endTime = ?, goalPolicyId = ?, isClosed = 1
      WHERE isClosed = 0
      `,
      [now, resolvedGoalPolicyId],
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
    goalPolicyId?: string | null;
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
      SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt, goalPolicyId
      FROM workdays
      WHERE startTime BETWEEN ? AND ?
      ORDER BY startTime ASC
      LIMIT 1
      `,
      [dayStart, dayEnd],
    );

    return row ? mapWorkdayRow(row) : null;
  }

  async findWorkdayIdsBetweenDates(
    startDate: Date,
    endDate: Date,
  ): Promise<{ id: number }[]> {
    const startOfRange = startOfLocalDay(startDate).toISOString();
    const endOfRange = endOfLocalDay(endDate).toISOString();

    return this.database.getAllAsync<{ id: number }>(
      `
      SELECT id
      FROM workdays
      WHERE startTime BETWEEN ? AND ?
      ORDER BY startTime ASC
      `,
      [startOfRange, endOfRange],
    );
  }

  async findWorkdaysBetweenDates(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    id: number;
    startTime: string;
    endTime: string | null;
    startOdometer: number | null;
    endOdometer: number | null;
    isClosed: boolean;
    createdAt: string;
    goalPolicyId?: string | null;
  }[]> {
    const startOfRange = startOfLocalDay(startDate).toISOString();
    const endOfRange = endOfLocalDay(endDate).toISOString();

    const rows = await this.database.getAllAsync<WorkdayRow>(
      `
      SELECT id, startTime, endTime, startOdometer, endOdometer, isClosed, createdAt, goalPolicyId
      FROM workdays
      WHERE startTime BETWEEN ? AND ?
      ORDER BY startTime ASC
      `,
      [startOfRange, endOfRange],
    );

    return rows.map(mapWorkdayRow);
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

import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

import { PaymentType, TripSource } from "../constants/enums";
import { GoalService } from "../services/GoalService";
import { SummaryService } from "../services/SummaryService";
import { TripQueryService } from "../services/TripQueryService";
import { WorkdayService } from "../services/WorkdayService";

export type TodayTripRow = {
  id: number;
  startTime: string;
  endTime: string | null;
  amount: number | null;
  source: TripSource;
  payment: PaymentType | null;
};

type TodayGoals = {
  daily: number;
  weekly: number;
  monthly: number;
};

type TodayWorkdayInfo = {
  startTime: string;
  endTime: string | null;
  isClosed: boolean;
};

type TodayActiveWorkday = {
  id: number;
  startTime: string;
} | null | undefined;

type TodayDailySummary = {
  total: number;
  taxi: number;
  uber: number;
  cabify: number;
  freeNow: number;
  efectivo: number;
  tarjeta: number;
  app: number;
  propinaTarjeta: number;
  propinaEfectivo: number;
} | null;

type TodayScreenState = {
  activeTripId: number | null;
  trips: TodayTripRow[];
  weeklySummary: any;
  monthlySummary: any;
  goals: TodayGoals;
  workdayInfo: TodayWorkdayInfo | null;
  activeWorkday: TodayActiveWorkday;
  dailySummary: TodayDailySummary;
  refreshData: () => Promise<void>;
};

async function loadTodayScreenData(selectedDate: Date) {
  const active = await TripQueryService.getActiveTrip();
  const weekSummary = await SummaryService.getWeekSummary();
  const monthSummary = await SummaryService.getMonthSummary();
  const workday = await WorkdayService.getOpenWorkday();
  const wd = await WorkdayService.getWorkdayInfoForDate(selectedDate);

  let trips: TodayTripRow[] = [];
  let dailySummary: TodayDailySummary = null;

  if (wd) {
    trips = (await TripQueryService.getTripsForDate(selectedDate)) as TodayTripRow[];
    dailySummary = await SummaryService.getSummaryForWorkday(wd.id);
  }

  return {
    activeTripId: active ? active.id : null,
    trips,
    weeklySummary: weekSummary,
    monthlySummary: monthSummary,
    workdayInfo: wd,
    activeWorkday: workday,
    dailySummary,
  };
}

export function useTodayScreen(selectedDate: Date): TodayScreenState {
  const [activeTripId, setActiveTripId] = useState<number | null>(null);
  const [trips, setTrips] = useState<TodayTripRow[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [goals, setGoals] = useState<TodayGoals>({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });
  const [workdayInfo, setWorkdayInfo] = useState<TodayWorkdayInfo | null>(null);
  const [activeWorkday, setActiveWorkday] = useState<TodayActiveWorkday>(null);
  const [dailySummary, setDailySummary] = useState<TodayDailySummary>(null);

  const refreshData = useCallback(async () => {
    const data = await loadTodayScreenData(selectedDate);

    setActiveTripId(data.activeTripId);
    setTrips(data.trips);
    setWeeklySummary(data.weeklySummary);
    setMonthlySummary(data.monthlySummary);
    setWorkdayInfo(data.workdayInfo);
    setActiveWorkday(data.activeWorkday);
    setDailySummary(data.dailySummary);
  }, [selectedDate]);

  useEffect(() => {
    refreshData().catch(console.error);
  }, [refreshData]);

  useFocusEffect(() => {
    GoalService.getGoals().then(setGoals);
  });

  return {
    activeTripId,
    trips,
    weeklySummary,
    monthlySummary,
    goals,
    workdayInfo,
    activeWorkday,
    dailySummary,
    refreshData,
  };
}

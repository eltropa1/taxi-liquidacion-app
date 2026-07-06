import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { PaymentType, TripSource } from "../constants/enums";
import {
  GoalService,
  SummaryService,
  TripQueryService,
  WorkdayService,
} from "../application/runtime";

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
  id: number;
  startTime: string;
  endTime: string | null;
  startOdometer: number | null;
  endOdometer: number | null;
  isClosed: boolean;
};

type TodayActiveWorkday = {
  id: number;
  startTime: string;
  startOdometer: number | null;
} | null | undefined;

type TodayDailySummary = {
  servicesTotal: number;
  servicesTaxi: number;
  servicesUber: number;
  servicesCabify: number;
  servicesFreeNow: number;
  servicesOther: number;
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

export async function loadTodayScreenData(selectedDate: Date) {
  const activePromise = TripQueryService.getActiveTrip();
  const weekSummaryPromise = SummaryService.getWeekSummary(selectedDate);
  const monthSummaryPromise = SummaryService.getMonthSummary();
  const workdayPromise = WorkdayService.getOpenWorkday();
  const workdayInfoPromise = WorkdayService.getWorkdayInfoForDate(selectedDate);

  const [active, weekSummary, monthSummary, workday, wd] = await Promise.all([
    activePromise,
    weekSummaryPromise,
    monthSummaryPromise,
    workdayPromise,
    workdayInfoPromise,
  ]);

  let trips: TodayTripRow[] = [];
  let dailySummary: TodayDailySummary = null;

  if (wd) {
    const tripsPromise = TripQueryService.getTripsForWorkday(wd.id);
    const dailySummaryPromise = SummaryService.getSummaryForWorkday(wd.id);

    [trips, dailySummary] = await Promise.all([
      tripsPromise as Promise<TodayTripRow[]>,
      dailySummaryPromise,
    ]);
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
  const hasMountedRef = useRef(false);
  const refreshRequestRef = useRef(0);

  const refreshData = useCallback(async () => {
    const requestId = ++refreshRequestRef.current;
    const data = await loadTodayScreenData(selectedDate);

    if (requestId !== refreshRequestRef.current) {
      return;
    }

    setActiveTripId(data.activeTripId);
    setTrips(data.trips);
    setWeeklySummary(data.weeklySummary);
    setMonthlySummary(data.monthlySummary);
    setWorkdayInfo(data.workdayInfo);
    setActiveWorkday(data.activeWorkday);
    setDailySummary(data.dailySummary);
  }, [selectedDate]);

  useEffect(() => {
    setActiveTripId(null);
    setTrips([]);
    setWeeklySummary(null);
    setMonthlySummary(null);
    setWorkdayInfo(null);
    setActiveWorkday(null);
    setDailySummary(null);
    refreshData().catch(console.error);
  }, [refreshData]);

  useFocusEffect(() => {
    GoalService.getGoals().then(setGoals);
  });

  useFocusEffect(
    useCallback(() => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }

      refreshData().catch(console.error);
    }, [refreshData]),
  );

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

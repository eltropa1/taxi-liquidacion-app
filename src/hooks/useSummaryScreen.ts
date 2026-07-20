import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  loadSummaryScreenData,
  type SummaryScreenCriticalState,
  type SummaryScreenEnrichmentState,
} from "./summaryScreenLoaders";

type SummaryScreenState = SummaryScreenCriticalState &
  SummaryScreenEnrichmentState & {
    refreshData: () => Promise<void>;
  };

export function useSummaryScreen(selectedDate: Date): SummaryScreenState {
  const [workdayInfo, setWorkdayInfo] =
    useState<SummaryScreenCriticalState["workdayInfo"]>(null);
  const [activeWorkday, setActiveWorkday] =
    useState<SummaryScreenCriticalState["activeWorkday"]>(null);
  const [trips, setTrips] =
    useState<SummaryScreenEnrichmentState["trips"]>([]);
  const [dailySummary, setDailySummary] =
    useState<SummaryScreenEnrichmentState["dailySummary"]>(null);
  const hasMountedRef = useRef(false);
  const refreshRequestRef = useRef(0);

  const refreshData = useCallback(async () => {
    const requestId = ++refreshRequestRef.current;
    const data = await loadSummaryScreenData(selectedDate);

    if (requestId !== refreshRequestRef.current) {
      return;
    }

    setWorkdayInfo(data.workdayInfo);
    setActiveWorkday(data.activeWorkday);
    setTrips(data.trips);
    setDailySummary(data.dailySummary);
  }, [selectedDate]);

  useEffect(() => {
    setWorkdayInfo(null);
    setActiveWorkday(null);
    setTrips([]);
    setDailySummary(null);
    refreshData().catch(console.error);
  }, [refreshData]);

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
    workdayInfo,
    activeWorkday,
    trips,
    dailySummary,
    refreshData,
  };
}

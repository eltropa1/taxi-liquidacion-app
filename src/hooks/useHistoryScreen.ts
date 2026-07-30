import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { loadHistoryScreenData, type HistoryScreenData } from "./historyScreenLoaders";
import type { HistoricalPeriodSelection } from "../application/history";

type HistoryScreenState = Readonly<{
  historyData: HistoryScreenData | null;
  error: string | null;
  refreshData: () => Promise<void>;
}>;

export function useHistoryScreen(
  selection: HistoricalPeriodSelection,
): HistoryScreenState {
  const [historyData, setHistoryData] = useState<HistoryScreenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasMountedRef = useRef(false);
  const refreshRequestRef = useRef(0);

  const refreshData = useCallback(async () => {
    const requestId = ++refreshRequestRef.current;

    try {
      const data = await loadHistoryScreenData(selection);

      if (requestId !== refreshRequestRef.current) {
        return;
      }

      setHistoryData(data);
      setError(null);
    } catch (nextError) {
      if (requestId !== refreshRequestRef.current) {
        return;
      }

      setHistoryData(null);
      setError(nextError instanceof Error ? nextError.message : "No se pudo cargar el historial");
    }
  }, [selection]);

  useEffect(() => {
    setHistoryData(null);
    setError(null);
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
    historyData,
    error,
    refreshData,
  };
}

import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import type { GoalPolicy, GoalsState } from "../application/ports/runtime";
import { loadGoalsScreenData, saveGoalsScreenData } from "./goalsScreenLoaders";

type GoalsScreenState = Readonly<{
  currentPolicy: GoalPolicy | null;
  goalHistory: readonly GoalPolicy[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  saveGoals: (goals: GoalsState) => Promise<void>;
}>;

export function useGoalsScreen(): GoalsScreenState {
  const [currentPolicy, setCurrentPolicy] = useState<GoalPolicy | null>(null);
  const [goalHistory, setGoalHistory] = useState<readonly GoalPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasMountedRef = useRef(false);
  const refreshRequestRef = useRef(0);

  const refreshData = useCallback(async () => {
    const requestId = ++refreshRequestRef.current;
    try {
      const data = await loadGoalsScreenData();

      if (requestId !== refreshRequestRef.current) {
        return;
      }

      setCurrentPolicy(data.currentPolicy);
      setGoalHistory(data.goalHistory);
    } catch (error) {
      console.error(error);
      if (requestId !== refreshRequestRef.current) {
        return;
      }

      setCurrentPolicy(null);
      setGoalHistory([]);
    } finally {
      if (requestId === refreshRequestRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const saveGoals = useCallback(async (goals: GoalsState) => {
    setIsLoading(true);
    try {
      const data = await saveGoalsScreenData(goals);
      setCurrentPolicy(data.currentPolicy);
      setGoalHistory(data.goalHistory);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
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
    currentPolicy,
    goalHistory,
    isLoading,
    refreshData,
    saveGoals,
  };
}

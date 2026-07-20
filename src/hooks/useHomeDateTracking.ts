import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { addCalendarDays } from "../utils/dateUtils";

export type HomeDateMode = "live" | "historical";

export type HomeDateState = Readonly<{
  selectedDate: Date;
  mode: HomeDateMode;
}>;

export function isSameLocalCalendarDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString();
}

export function getMsUntilNextLocalMidnight(now: Date = new Date()) {
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );

  return Math.max(nextMidnight.getTime() - now.getTime(), 0);
}

export function reconcileHomeDateState(
  state: HomeDateState,
  nextDate: Date,
): HomeDateState {
  if (state.mode === "historical") {
    return state;
  }

  if (isSameLocalCalendarDay(state.selectedDate, nextDate)) {
    return state;
  }

  return {
    selectedDate: nextDate,
    mode: "live",
  };
}

export function useHomeDateTracking() {
  const [state, setState] = useState<HomeDateState>(() => ({
    selectedDate: new Date(),
    mode: "live",
  }));

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setHistoricalDate = useCallback((date: Date) => {
    setState({
      selectedDate: date,
      mode: "historical",
    });
  }, []);

  const shiftHistoricalDate = useCallback((days: number) => {
    setState((current) => ({
      selectedDate: addCalendarDays(current.selectedDate, days),
      mode: "historical",
    }));
  }, []);

  const goToToday = useCallback(() => {
    setState({
      selectedDate: new Date(),
      mode: "live",
    });
  }, []);

  const syncToCurrentDayIfFollowingToday = useCallback(() => {
    const now = new Date();
    setState((currentState) => {
      const nextState = reconcileHomeDateState(currentState, now);

      if (nextState !== currentState) {
        stateRef.current = nextState;
      }

      return nextState;
    });
  }, []);

  useEffect(() => {
    if (state.mode !== "live") {
      return;
    }

    const timeout = setTimeout(() => {
      syncToCurrentDayIfFollowingToday();
    }, getMsUntilNextLocalMidnight());

    return () => clearTimeout(timeout);
  }, [state.mode, state.selectedDate, syncToCurrentDayIfFollowingToday]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        syncToCurrentDayIfFollowingToday();
      }
    });

    return () => subscription.remove();
  }, [syncToCurrentDayIfFollowingToday]);

  useFocusEffect(
    useCallback(() => {
      syncToCurrentDayIfFollowingToday();
    }, [syncToCurrentDayIfFollowingToday]),
  );

  return {
    selectedDate: state.selectedDate,
    mode: state.mode,
    isFollowingToday: state.mode === "live",
    setHistoricalDate,
    shiftHistoricalDate,
    goToToday,
    syncToCurrentDayIfFollowingToday,
  };
}

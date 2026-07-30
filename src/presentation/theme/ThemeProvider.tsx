import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  colors as lightColors,
  darkColors,
  radii,
  shadowCard,
  shadowCardDark,
  spacing,
  buildTypography,
  type ThemeColors,
} from "./tokens";

export type ThemePreference = "auto" | "light" | "dark";
export type ResolvedScheme = "light" | "dark";

const STORAGE_KEY = "geotaxi.themePreference";
const NIGHT_START_HOUR = 21;
const NIGHT_END_HOUR = 7;
const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

function isNightNow(): boolean {
  const hour = new Date().getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

function resolveScheme(preference: ThemePreference): ResolvedScheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return isNightNow() ? "dark" : "light";
}

type ThemeContextValue = {
  scheme: ResolvedScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  colors: ThemeColors;
  radii: typeof radii;
  spacing: typeof spacing;
  shadowCard: typeof shadowCard;
  typography: ReturnType<typeof buildTypography>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [scheme, setScheme] = useState<ResolvedScheme>(() => resolveScheme("auto"));

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "auto" || stored === "light" || stored === "dark") {
          setPreferenceState(stored);
          setScheme(resolveScheme(stored));
        }
      })
      .catch(() => {
        // Sin preferencia guardada legible: se queda en "auto".
      });
  }, []);

  useEffect(() => {
    setScheme(resolveScheme(preference));

    if (preference !== "auto") {
      return;
    }

    const recheck = () => setScheme(resolveScheme("auto"));
    const interval = setInterval(recheck, RECHECK_INTERVAL_MS);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") recheck();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [preference]);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    setScheme(resolveScheme(next));
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // La sesión sigue funcionando con la preferencia en memoria aunque no persista.
    });
  };

  const value = useMemo<ThemeContextValue>(() => {
    const activeColors = scheme === "dark" ? darkColors : lightColors;
    return {
      scheme,
      preference,
      setPreference,
      colors: activeColors,
      radii,
      spacing,
      shadowCard: scheme === "dark" ? shadowCardDark : shadowCard,
      typography: buildTypography(activeColors),
    };
  }, [scheme, preference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme debe usarse dentro de ThemeProvider");
  }
  return ctx;
}

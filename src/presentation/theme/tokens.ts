/**
 * Fuente única de verdad para los design tokens de GeoTaxi.
 * Espejo literal de docs/design/design.md — cualquier cambio de valor
 * empieza en ese documento, no aquí.
 */

export type ThemeColors = {
  bg: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  primarySubtle: string;
  border: string;
  warning: string;
  warningSubtle: string;
  danger: string;
  dangerSubtle: string;
};

export const colors: ThemeColors = {
  bg: "#F7F3EC",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  primary: "#1C7C43",
  primarySubtle: "#E3F3E9",
  border: "#E7E1D7",
  warning: "#7A4D00",
  warningSubtle: "#FFF8E1",
  danger: "#DC2626",
  dangerSubtle: "#FFFAFA",
};

export const darkColors: ThemeColors = {
  bg: "#14120F",
  surface: "#1E1B17",
  textPrimary: "#F2EEE7",
  textSecondary: "#A79E90",
  primary: "#35A166",
  primarySubtle: "#14291B",
  border: "#322D26",
  warning: "#D4A017",
  warningSubtle: "#332908",
  danger: "#E4534A",
  dangerSubtle: "#331311",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  card: 16,
  button: 14,
} as const;

export type RadiiTokens = typeof radii;

export type ShadowCardTokens = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

export const shadowCard: ShadowCardTokens = {
  shadowColor: "#000000",
  shadowOpacity: 0.06,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

// En oscuro la sombra apenas aporta (el contraste de superficie ya separa
// capas); se mantiene solo para no romper el layout de quienes la spread-ean.
export const shadowCardDark: ShadowCardTokens = {
  shadowColor: "#000000",
  shadowOpacity: 0.3,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

export function buildTypography(c: typeof colors) {
  return {
    display: { fontSize: 30, fontWeight: "600" as const, color: c.textPrimary },
    title: { fontSize: 24, fontWeight: "700" as const, color: c.textPrimary },
    heading: { fontSize: 17, fontWeight: "600" as const, color: c.textPrimary },
    body: { fontSize: 15, fontWeight: "400" as const, color: c.textPrimary },
    caption: { fontSize: 13, fontWeight: "400" as const, color: c.textSecondary },
  };
}

export const typography = buildTypography(colors);

export const theme = {
  colors,
  spacing,
  radii,
  shadowCard,
  typography,
} as const;

export type Theme = typeof theme;

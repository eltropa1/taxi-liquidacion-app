import { useAppTheme } from "../theme/ThemeProvider";

export type SignatureTokens = {
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    ink: string;
    inkSoft: string;
    green: string;
    border: string;
    danger: string;
  };
  radii: {
    card: number;
  };
};

/**
 * Puente hacia la fuente única de tema (ThemeProvider / tokens.ts),
 * remapeado al shape que consume app/(tabs)/index.tsx. Reactivo al
 * esquema claro/oscuro activo.
 */
export function useSignatureTokens(): SignatureTokens {
  const { colors, radii } = useAppTheme();

  return {
    colors: {
      background: colors.bg,
      surface: colors.surface,
      surfaceMuted: colors.border,
      ink: colors.textPrimary,
      inkSoft: colors.textSecondary,
      green: colors.primary,
      border: colors.border,
      danger: colors.danger,
    },
    radii: {
      card: radii.card,
    },
  };
}

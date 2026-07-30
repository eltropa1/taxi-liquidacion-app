import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { EconomicDrilldownGroup } from "../../presentation/economics";
import { useAppTheme } from "../../presentation/theme/ThemeProvider";
import type { ThemeColors } from "../../presentation/theme/tokens";

type EconomicDrilldownRowProps = Readonly<{
  group: EconomicDrilldownGroup;
  onPress: () => void;
  accessibilityLabel?: string;
}>;

export function EconomicDrilldownRow({
  group,
  onPress,
  accessibilityLabel,
}: EconomicDrilldownRowProps) {
  const { colors: themeColors } = useAppTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Abrir grupo ${group.title}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.title}>{group.title}</Text>
        <Text style={styles.subtitle}>{group.subtitle}</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.count}>{group.count}</Text>
        <Text style={styles.amount}>{formatMoney(group.amount)}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} €`;
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 4,
    backgroundColor: "transparent",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: themeColors.border,
  },
  pressed: {
    opacity: 0.78,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: themeColors.textSecondary,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  count: {
    minWidth: 24,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textSecondary,
  },
  amount: {
    minWidth: 84,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  chevron: {
    fontSize: 18,
    fontWeight: "800",
    color: themeColors.textSecondary,
  },
  });
}

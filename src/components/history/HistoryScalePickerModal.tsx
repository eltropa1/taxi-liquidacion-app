import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { ThemeColors, RadiiTokens } from "../../presentation/theme/tokens";
import { useAppTheme } from "../../presentation/theme/ThemeProvider";

export type HistoryScalePickerOption = Readonly<{
  value: "week" | "fortnight" | "month" | "year" | "custom";
  label: string;
  description: string;
}>;

type HistoryScalePickerModalProps = Readonly<{
  visible: boolean;
  currentScale: HistoryScalePickerOption["value"];
  onCancel: () => void;
  onSelectScale: (scale: HistoryScalePickerOption["value"]) => void;
}>;

const OPTIONS: readonly HistoryScalePickerOption[] = [
  {
    value: "week",
    label: "Semana",
    description: "Semana operativa certificada.",
  },
  {
    value: "fortnight",
    label: "Quincena",
    description: "1-15 o 16-fin de mes.",
  },
  {
    value: "month",
    label: "Mes",
    description: "Mes calendario con semanas oficiales.",
  },
  {
    value: "year",
    label: "Año",
    description: "Año calendario completo.",
  },
  {
    value: "custom",
    label: "Personalizado",
    description: "Rango libre dentro del universo histórico.",
  },
];

export function HistoryScalePickerModal({
  visible,
  currentScale,
  onCancel,
  onSelectScale,
}: HistoryScalePickerModalProps) {
  const { colors: themeColors, radii: themeRadii } = useAppTheme();
  const styles = useMemo(() => createStyles(themeColors, themeRadii), [themeColors, themeRadii]);
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Cambiar escala</Text>
          <Text style={styles.subtitle}>Selecciona cómo quieres leer el historial.</Text>

          <View style={styles.optionList}>
            {OPTIONS.map((option) => {
              const active = option.value === currentScale;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => onSelectScale(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Cambiar a ${option.label}`}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    active && styles.optionRowActive,
                    pressed && styles.optionRowPressed,
                  ]}
                >
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  {active ? (
                    <Text style={styles.optionBadge}>Actual</Text>
                  ) : (
                    <Text style={styles.optionChevron}>›</Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(themeColors: ThemeColors, themeRadii: RadiiTokens) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: themeRadii.card,
    padding: 18,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: themeColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: themeColors.textSecondary,
  },
  optionList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: themeRadii.card,
    backgroundColor: themeColors.bg,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  optionRowActive: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.primarySubtle,
  },
  optionRowPressed: {
    opacity: 0.84,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  optionLabelActive: {
    color: themeColors.primary,
  },
  optionDescription: {
    fontSize: 12,
    color: themeColors.textSecondary,
  },
  optionBadge: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: themeColors.primary,
  },
  optionChevron: {
    fontSize: 18,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 2,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  });
}

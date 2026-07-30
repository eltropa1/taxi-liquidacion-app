import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { ThemeColors, RadiiTokens } from "../../presentation/theme/tokens";
import { useAppTheme } from "../../presentation/theme/ThemeProvider";

function createLocalNoonDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 12, 0, 0, 0);
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isSameDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString();
}

function sortRangeDates(left: Date, right: Date): [Date, Date] {
  return left.getTime() <= right.getTime() ? [left, right] : [right, left];
}

function isFutureDay(date: Date) {
  const todayEnd = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    23,
    59,
    59,
    999,
  );

  return date.getTime() > todayEnd.getTime();
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type CustomRangeModalProps = Readonly<{
  visible: boolean;
  initialStartDate: Date;
  initialEndDate: Date;
  onCancel: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
}>;

export function HistoryCustomRangeModal({
  visible,
  initialStartDate,
  initialEndDate,
  onCancel,
  onApply,
}: CustomRangeModalProps) {
  const { colors: themeColors, radii: themeRadii } = useAppTheme();
  const styles = useMemo(() => createStyles(themeColors, themeRadii), [themeColors, themeRadii]);
  const [startDate, setStartDate] = useState(() => createLocalNoonDate(initialStartDate));
  const [endDate, setEndDate] = useState(() => createLocalNoonDate(initialEndDate));
  const [activeField, setActiveField] = useState<"start" | "end">("start");
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(initialStartDate));

  useEffect(() => {
    if (!visible) {
      return;
    }

    const normalizedStart = createLocalNoonDate(initialStartDate);
    const normalizedEnd = createLocalNoonDate(initialEndDate);
    const [orderedStart, orderedEnd] = sortRangeDates(normalizedStart, normalizedEnd);

    setStartDate(orderedStart);
    setEndDate(orderedEnd);
    setActiveField("start");
    setCalendarMonth(startOfMonth(orderedStart));
  }, [initialEndDate, initialStartDate, visible]);

  const monthLabel = useMemo(
    () =>
      calendarMonth.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      }),
    [calendarMonth],
  );

  const handleDayPress = (day: Date) => {
    if (isFutureDay(day)) {
      return;
    }

    if (activeField === "start") {
      const [nextStart, nextEnd] = sortRangeDates(createLocalNoonDate(day), endDate);
      setStartDate(nextStart);
      setEndDate(nextEnd);
      setActiveField("end");
      setCalendarMonth(startOfMonth(day));
      return;
    }

    const [nextStart, nextEnd] = sortRangeDates(startDate, createLocalNoonDate(day));
    setStartDate(nextStart);
    setEndDate(nextEnd);
    setCalendarMonth(startOfMonth(day));
  };

  const startLabel = formatDateLabel(startDate);
  const endLabel = formatDateLabel(endDate);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Rango personalizado</Text>
          <Text style={styles.subtitle}>Elige desde y hasta, sin superar hoy.</Text>

          <View style={styles.rangeRow}>
            <Pressable
              onPress={() => setActiveField("start")}
              style={[
                styles.rangeChip,
                activeField === "start" && styles.rangeChipActive,
              ]}
            >
              <Text style={styles.rangeChipLabel}>Desde</Text>
              <Text style={styles.rangeChipValue}>{startLabel}</Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveField("end")}
              style={[styles.rangeChip, activeField === "end" && styles.rangeChipActive]}
            >
              <Text style={styles.rangeChipLabel}>Hasta</Text>
              <Text style={styles.rangeChipValue}>{endLabel}</Text>
            </Pressable>
          </View>

          <View style={styles.calendarHeader}>
            <Pressable hitSlop={10} onPress={() => setCalendarMonth((current) => addMonths(current, -1))}>
              <Text style={styles.calendarArrow}>‹</Text>
            </Pressable>

            <Text style={styles.monthLabel}>{monthLabel}</Text>

            <Pressable hitSlop={10} onPress={() => setCalendarMonth((current) => addMonths(current, 1))}>
              <Text style={styles.calendarArrow}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekdaysRow}>
            {["L", "M", "X", "J", "V", "S", "D"].map((label) => (
              <Text key={label} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {Array.from({
              length: (calendarMonth.getDay() + 6) % 7,
            }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.calendarCell} />
            ))}

            {Array.from({ length: getDaysInMonth(calendarMonth) }, (_, index) => {
              const day = new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth(),
                index + 1,
                12,
                0,
                0,
                0,
              );
              const selected = isSameDay(day, startDate) || isSameDay(day, endDate);
              const disabled = isFutureDay(day);

              return (
                <Pressable
                  key={day.toISOString()}
                  disabled={disabled}
                  onPress={() => handleDayPress(day)}
                  style={({ pressed }) => [
                    styles.calendarCell,
                    selected && styles.calendarCellSelected,
                    disabled && styles.calendarCellDisabled,
                    pressed && !disabled && styles.calendarCellPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarCellText,
                      selected && styles.calendarCellTextSelected,
                      disabled && styles.calendarCellTextDisabled,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Pressable onPress={onCancel} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={() => onApply(startDate, endDate)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Usar rango</Text>
            </Pressable>
          </View>
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
  rangeRow: {
    flexDirection: "row",
    gap: 10,
  },
  rangeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: themeRadii.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
    backgroundColor: themeColors.bg,
  },
  rangeChipActive: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.primarySubtle,
  },
  rangeChipLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: themeColors.textSecondary,
    textTransform: "uppercase",
  },
  rangeChipValue: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
  },
  calendarArrow: {
    fontSize: 22,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: themeColors.textPrimary,
    textTransform: "capitalize",
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekdayLabel: {
    width: 36,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: themeColors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: "14.2857%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  calendarCellPressed: {
    backgroundColor: themeColors.bg,
  },
  calendarCellSelected: {
    backgroundColor: themeColors.primary,
  },
  calendarCellDisabled: {
    opacity: 0.35,
  },
  calendarCellText: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  calendarCellTextSelected: {
    color: themeColors.surface,
  },
  calendarCellTextDisabled: {
    color: themeColors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: themeRadii.button,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themeColors.surface,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: themeRadii.button,
    // Confirma un filtro de navegación, no avanza trabajo/ingresos — neutro.
    backgroundColor: themeColors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.surface,
  },
  });
}

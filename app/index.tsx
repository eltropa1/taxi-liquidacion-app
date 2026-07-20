import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { TripHistory } from "../src/components/trip-history";
import {
  CompleteServiceFlowController,
  type CompleteServiceFlowControllerHandle,
} from "../src/components/trips/CompleteServiceFlowController";
import { PaymentType, TripSource } from "../src/constants/enums";
import { useTodayScreen } from "../src/hooks/useTodayScreen";
import { useHomeDateTracking } from "../src/hooks/useHomeDateTracking";
import { useTripActions } from "../src/hooks/useTripActions";
import { buildTodayScreenProjection, toTripVisualProjection } from "../src/presentation";
import { UpdateWorkday } from "../src/application/workdays/UpdateWorkday";
import {
  parsePositiveIntegerInput,
  validateWorkdayOdometers,
} from "../src/domain/workdays/workdayOdometer";

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} €`;
}

function formatDateLabel(date: Date) {
  return capitalize(
    date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  );
}

function formatTimeLabel(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function platformIdToTripSource(platformId: string) {
  switch (platformId) {
    case "uber":
      return TripSource.UBER;
    case "cabify":
      return TripSource.CABIFY;
    case "freeNow":
      return TripSource.FREE_NOW;
    default:
      return TripSource.TAXI;
  }
}

function getProgressPercent(current: number, goal: number) {
  if (goal <= 0) return null;
  return (current / goal) * 100;
}

function clampPercent(percent: number | null) {
  if (percent === null) return 0;
  return Math.min(percent, 100);
}

function ProgressBar({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  return (
    <View style={styles.progressRail}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${percent}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
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

function getMonthLabel(date: Date) {
  return capitalize(
    date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    }),
  );
}

export default function TodayScreen() {
  const [lastPayment, setLastPayment] = useState<PaymentType>(PaymentType.CASH);
  const [lastSource, setLastSource] = useState<TripSource>(TripSource.TAXI);
  const {
    selectedDate,
    setHistoricalDate,
    shiftHistoricalDate,
    goToToday,
  } = useHomeDateTracking();

  type WorkdayModalMode = "open" | "close" | "edit" | null;
  const [workdayModalMode, setWorkdayModalMode] =
    useState<WorkdayModalMode>(null);
  const [workdayStartOdometerInput, setWorkdayStartOdometerInput] =
    useState("");
  const [workdayEndOdometerInput, setWorkdayEndOdometerInput] = useState("");
  const [editingWorkdayId, setEditingWorkdayId] = useState<number | null>(null);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(new Date()),
  );

  const {
    activeTripId,
    trips,
    weeklySummary,
    monthlySummary,
    goals,
    workdayInfo,
    activeWorkday,
    dailySummary,
    refreshData,
  } = useTodayScreen(selectedDate);

  const {
    handleStartTrip,
    handleCloseActiveTrip,
    handleOpenWorkday,
    handleCloseWorkday,
  } = useTripActions({
    refreshData,
    setLastPayment,
    setLastSource,
  });

  const completeServiceFlowRef = useRef<CompleteServiceFlowControllerHandle | null>(
    null,
  );

  const tripHistoryProjections = useMemo(
    () => trips.map((trip) => toTripVisualProjection(trip)),
    [trips],
  );

  const todayProjection = useMemo(
    () =>
      buildTodayScreenProjection({
        selectedDate,
        activeTripId,
        trips,
        weeklySummary,
        monthlySummary,
        goals,
        workdayInfo,
        activeWorkday,
        dailySummary,
      }),
    [
      activeTripId,
      activeWorkday,
      dailySummary,
      goals,
      monthlySummary,
      selectedDate,
      trips,
      weeklySummary,
      workdayInfo,
    ],
  );

  const hasActiveWorkday = Boolean(activeWorkday);
  const hasOperationalContext =
    hasActiveWorkday || workdayInfo !== null || trips.length > 0;

  const progressPercent = getProgressPercent(todayProjection.totalToday, goals.daily);
  const progressFill = clampPercent(progressPercent);
  const remainingDaily = Math.max(goals.daily - todayProjection.totalToday, 0);

  const actionLabel = !hasActiveWorkday
    ? "Abrir jornada"
    : activeTripId
      ? "Finalizar servicio"
      : "Nuevo servicio";

  const actionHandler = !hasActiveWorkday
    ? () => openWorkdayModal("open")
    : activeTripId
      ? handleOpenFinish
      : handleStartTrip;

  const handleActionPress = () => {
    actionHandler();
  };

  const contextStartTime = workdayInfo?.startTime ?? activeWorkday?.startTime ?? null;

  function openDatePickerModal() {
    setCalendarMonth(startOfMonth(selectedDate));
    setShowDatePickerModal(true);
  }

  function closeDatePickerModal() {
    setShowDatePickerModal(false);
  }

  function openWorkdayModal(mode: Exclude<WorkdayModalMode, null>) {
    setWorkdayModalMode(mode);
    if (mode === "edit") {
      setEditingWorkdayId(workdayInfo?.id ?? null);
      setWorkdayStartOdometerInput(
        workdayInfo?.startOdometer !== null &&
          workdayInfo?.startOdometer !== undefined
          ? String(workdayInfo.startOdometer)
          : "",
      );
      setWorkdayEndOdometerInput(
        workdayInfo?.endOdometer !== null && workdayInfo?.endOdometer !== undefined
          ? String(workdayInfo.endOdometer)
          : "",
      );
      return;
    }

    setEditingWorkdayId(null);
    setWorkdayStartOdometerInput("");
    setWorkdayEndOdometerInput("");
  }

  const closeWorkdayModal = () => {
    setWorkdayModalMode(null);
    setEditingWorkdayId(null);
    setWorkdayStartOdometerInput("");
    setWorkdayEndOdometerInput("");
  };

  async function handleOpenFinish() {
    const result = await handleCloseActiveTrip();
    if (result.finalized && result.tripId !== null) {
      completeServiceFlowRef.current?.openForTrip({
        tripId: result.tripId,
        payment: lastPayment,
        source: lastSource,
      });
    }
  };

  const handleSaveWorkday = async () => {
    if (workdayModalMode === null) {
      return;
    }

    if (workdayModalMode === "open") {
      const startOdometer = parsePositiveIntegerInput(workdayStartOdometerInput);
      const validation = validateWorkdayOdometers(startOdometer, null);

      if (!validation.ok || startOdometer === null) {
        Alert.alert(
          "Odómetro inicial inválido",
          "Introduce un odómetro inicial entero y positivo.",
        );
        return;
      }

      await handleOpenWorkday(startOdometer);
      closeWorkdayModal();
      return;
    }

    if (workdayModalMode === "close") {
      const trimmedEndOdometer = workdayEndOdometerInput.trim();
      const endOdometer =
        trimmedEndOdometer === ""
          ? null
          : parsePositiveIntegerInput(trimmedEndOdometer);

      if (trimmedEndOdometer !== "" && endOdometer === null) {
        Alert.alert(
          "Odómetro final inválido",
          "Introduce un odómetro final entero y positivo, o déjalo vacío.",
        );
        return;
      }

      await handleCloseWorkday(endOdometer);
      closeWorkdayModal();
      return;
    }

    const startOdometer = parsePositiveIntegerInput(workdayStartOdometerInput);
    const trimmedEndOdometer = workdayEndOdometerInput.trim();
    const endOdometer =
      trimmedEndOdometer === ""
        ? null
        : parsePositiveIntegerInput(trimmedEndOdometer);

    const validation = validateWorkdayOdometers(startOdometer, endOdometer);

    if (!validation.ok) {
      if (validation.error === "START_ODOMETER_REQUIRED") {
        Alert.alert(
          "Odómetro inicial obligatorio",
          "Introduce un odómetro inicial entero y positivo.",
        );
        return;
      }

      if (
        validation.error === "START_ODOMETER_INVALID" ||
        validation.error === "END_ODOMETER_INVALID"
      ) {
        Alert.alert(
          "Odómetro inválido",
          "Los odómetros deben ser enteros y positivos.",
        );
        return;
      }

      Alert.alert(
        "Odómetros incoherentes",
        "El odómetro final no puede ser menor que el inicial.",
      );
      return;
    }

    if (startOdometer === null || editingWorkdayId === null) {
      return;
    }

    await UpdateWorkday.execute({
      id: editingWorkdayId,
      startOdometer,
      endOdometer,
    });
    closeWorkdayModal();
    await refreshData();
  };

  const showProgressBlock = hasOperationalContext;
  const showClosedState = !hasActiveWorkday;
  const isLatestAvailableDate = isSameDay(selectedDate, new Date());

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.contextBar}>
          <View style={styles.contextBarTopRow}>
            <Text style={styles.contextDate}>{formatDateLabel(selectedDate)}</Text>

            <View style={styles.contextBarTopActions}>
              <Text style={styles.contextStart}>
                Inicio {formatTimeLabel(contextStartTime)}
              </Text>
            </View>
          </View>

          <View style={styles.contextBarBottomRow}>
            <View style={styles.contextBarBottomLeft}>
              <Pressable
                hitSlop={10}
                onPress={() => shiftHistoricalDate(-1)}
              >
                <Text style={styles.dateNavigatorArrow}>‹</Text>
              </Pressable>

              <Pressable
                hitSlop={10}
                onPress={openDatePickerModal}
                style={({ pressed }) => [
                  styles.contextCalendarButton,
                  pressed && styles.contextCalendarButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Abrir selector de fechas"
              >
                <Text style={styles.contextCalendarIcon}>📅</Text>
              </Pressable>

              <Pressable
                hitSlop={10}
                disabled={isLatestAvailableDate}
                onPress={() => shiftHistoricalDate(1)}
                style={({ pressed }) => [
                  isLatestAvailableDate && styles.dateNavigatorDisabled,
                  pressed && !isLatestAvailableDate && styles.dateNavigatorPressed,
                ]}
              >
                <Text
                  style={[
                    styles.dateNavigatorArrow,
                    isLatestAvailableDate && styles.dateNavigatorArrowDisabled,
                  ]}
                >
                  ›
                </Text>
              </Pressable>
            </View>

            <View style={styles.contextBarBottomAction}>
              {hasActiveWorkday ? (
                <Pressable
                  onPress={() => openWorkdayModal("close")}
                  style={({ pressed }) => [
                    styles.contextCloseWorkdayButton,
                    pressed && styles.contextCloseWorkdayButtonPressed,
                  ]}
                >
                  <Text style={styles.contextCloseWorkdayText}>Cerrar jornada</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        {showProgressBlock && (
          <View style={styles.progressBlock}>
            <View style={styles.progressLeft}>
              <Text style={styles.progressLabel}>Recaudación</Text>
              <Text
                style={styles.progressAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {formatMoney(todayProjection.totalToday)}
              </Text>
            </View>

            <View style={styles.progressDivider} />

            <View style={styles.progressRight}>
              <Text style={styles.progressTopLine} numberOfLines={1}>
                {progressPercent !== null && progressPercent >= 100 ? (
                  <Text style={styles.progressTopReached}>Objetivo alcanzado</Text>
                ) : (
                  <>
                    <Text style={styles.progressTopLabel}>Objetivo </Text>
                    <Text style={styles.progressTopGoal}>
                      {formatMoney(goals.daily).replace(" €", "\u00A0€")}
                    </Text>
                    <Text style={styles.progressTopSpacer}>   </Text>
                    <Text style={styles.progressTopLabel}>Restan </Text>
                    <Text style={styles.progressTopRemaining}>
                      {formatMoney(remainingDaily).replace(" €", "\u00A0€")}
                    </Text>
                  </>
                )}
              </Text>

              <View style={styles.progressMeterRow}>
                <View style={styles.progressMeterWrap}>
                  <ProgressBar
                    percent={progressFill}
                    color="#1f2937"
                  />
                </View>
                <Text style={styles.progressPercentLabel}>
                  {progressPercent === null ? "0%" : `${Math.round(progressPercent)}%`}
                </Text>
              </View>
            </View>
          </View>
        )}

        {showClosedState && (
          <View style={styles.closedState}>
            <Text style={styles.closedStateTitle}>Jornada cerrada</Text>
            <Text style={styles.closedStateDescription}>
              Abre la jornada para empezar a registrar servicios.
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleActionPress}
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
        >
          <View style={styles.actionCardLeftIcon}>
            <Text style={styles.actionCardPlus}>+</Text>
          </View>
          <Text style={styles.actionCardLabel}>{actionLabel}</Text>
          <Text style={styles.actionCardArrow}>›</Text>
        </Pressable>

        <View style={styles.registerArea}>
          <TripHistory
            trips={tripHistoryProjections}
            onPendingTripPress={(trip) =>
              completeServiceFlowRef.current?.openForPendingService({
                tripId: trip.id,
                payment: lastPayment,
                source: platformIdToTripSource(trip.platform.id),
              })
            }
            onRegisteredTripPress={(tripId) =>
              router.push({
                pathname: "/trip/edit",
                params: { tripId },
              })
            }
            />
        </View>
      </View>

      <View style={styles.bottomNav}>
        <Pressable
          onPress={goToToday}
          style={({ pressed }) => [
            styles.bottomNavItem,
            pressed && styles.bottomNavItemPressed,
          ]}
        >
          <Text style={[styles.bottomNavLabel, styles.bottomNavLabelActive]}>
            Home
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/goals")}
          style={({ pressed }) => [
            styles.bottomNavItem,
            pressed && styles.bottomNavItemPressed,
          ]}
        >
          <Text style={styles.bottomNavLabel}>Metas</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/summary",
              params: { date: selectedDate.toISOString() },
            })
          }
          style={({ pressed }) => [
            styles.bottomNavItem,
            pressed && styles.bottomNavItemPressed,
          ]}
        >
          <Text style={styles.bottomNavLabel}>Resumen</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/settings")}
          style={({ pressed }) => [
            styles.bottomNavItem,
            pressed && styles.bottomNavItemPressed,
          ]}
        >
          <Text style={styles.bottomNavLabel}>Más</Text>
        </Pressable>
      </View>

      <Modal visible={workdayModalMode !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {workdayModalMode === "open"
                ? "Abrir día de trabajo"
                : workdayModalMode === "close"
                  ? "Cerrar día de trabajo"
                  : "Editar odómetros"}
            </Text>

            {(workdayModalMode === "open" || workdayModalMode === "edit") && (
              <>
                <Text>Odómetro inicial</Text>
                <TextInput
                  value={workdayStartOdometerInput}
                  onChangeText={setWorkdayStartOdometerInput}
                  keyboardType="number-pad"
                  placeholder="123456"
                  style={styles.input}
                />
              </>
            )}

            {(workdayModalMode === "close" || workdayModalMode === "edit") && (
              <>
                <Text style={{ marginTop: 10 }}>
                  Odómetro final
                  {workdayModalMode === "close" ? " (opcional)" : ""}
                </Text>
                <TextInput
                  value={workdayEndOdometerInput}
                  onChangeText={setWorkdayEndOdometerInput}
                  keyboardType="number-pad"
                  placeholder="123789"
                  style={styles.input}
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable onPress={closeWorkdayModal} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={handleSaveWorkday} style={styles.modalButtonPrimary}>
                <Text style={styles.modalButtonPrimaryText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <CompleteServiceFlowController
        ref={completeServiceFlowRef}
        refreshData={refreshData}
        setLastPayment={setLastPayment}
        setLastSource={setLastSource}
        onCompleteLater={refreshData}
      />

      <Modal visible={showDatePickerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.calendarHeader}>
              <Pressable
                hitSlop={10}
                onPress={() => setCalendarMonth((current) => addMonths(current, -1))}
              >
                <Text style={styles.calendarHeaderArrow}>‹</Text>
              </Pressable>

              <Text style={styles.modalTitle}>{getMonthLabel(calendarMonth)}</Text>

              <Pressable
                hitSlop={10}
                onPress={() => setCalendarMonth((current) => addMonths(current, 1))}
              >
                <Text style={styles.calendarHeaderArrow}>›</Text>
              </Pressable>
            </View>

            <View style={styles.calendarWeekdays}>
              {["L", "M", "X", "J", "V", "S", "D"].map((label) => (
                <Text key={label} style={styles.calendarWeekday}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {Array.from({
                length:
                  (new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth(),
                    1,
                  ).getDay() +
                    6) %
                  7,
              })
                .fill(null)
                .map((_, index) => (
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
                const selected = isSameDay(day, selectedDate);

                return (
                  <Pressable
                    key={day.toISOString()}
                    onPress={() => {
                      setHistoricalDate(day);
                      setShowDatePickerModal(false);
                    }}
                    style={({ pressed }) => [
                      styles.calendarCell,
                      selected && styles.calendarCellSelected,
                      pressed && styles.calendarCellPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarCellText,
                        selected && styles.calendarCellTextSelected,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalButtons}>
              <Pressable onPress={closeDatePickerModal} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F2EA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  contextBar: {
    gap: 8,
    marginBottom: 6,
  },
  contextBarTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  contextBarTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  contextDate: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    flexShrink: 1,
  },
  contextStart: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2ecc71",
  },
  contextCalendarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFE8DD",
    alignItems: "center",
    justifyContent: "center",
  },
  contextCalendarButtonPressed: {
    opacity: 0.75,
  },
  contextCalendarIcon: {
    fontSize: 14,
    color: "#2ecc71",
  },
  contextBarBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contextBarBottomLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateNavigator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  dateNavigatorArrow: {
    fontSize: 22,
    color: "#1F2937",
    paddingHorizontal: 12,
  },
  dateNavigatorArrowDisabled: {
    color: "#C3B8AA",
  },
  dateNavigatorPressed: {
    opacity: 0.75,
  },
  dateNavigatorDisabled: {
    opacity: 0.45,
  },
  dateNavigatorLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.3,
  },
  contextBarBottomAction: {
    flexShrink: 0,
    alignItems: "flex-end",
  },
  contextCloseWorkdayButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#EFE8DD",
  },
  contextCloseWorkdayButtonPressed: {
    opacity: 0.75,
  },
  contextCloseWorkdayText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  progressBlock: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 0,
    marginBottom: 12,
    alignItems: "center",
  },
  progressLeft: {
    flex: 1,
    justifyContent: "flex-start",
    minHeight: 104,
    paddingTop: 2,
  },
  progressDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "rgba(17, 24, 39, 0.10)",
  },
  progressRight: {
    flex: 2,
    justifyContent: "space-between",
    minHeight: 104,
    paddingLeft: 10,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: "#2ecc71",
    textTransform: "uppercase",
  },
  progressAmount: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    color: "#111827",
    flexShrink: 1,
  },
  progressTopLine: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    textAlign: "left",
    flexWrap: "nowrap",
  },
  progressTopLabel: {
    color: "#111827",
  },
  progressTopGoal: {
    color: "#2ecc71",
  },
  progressTopRemaining: {
    color: "#D97706",
  },
  progressTopReached: {
    color: "#111827",
    fontWeight: "800",
  },
  progressTopSpacer: {
    color: "#111827",
  },
  progressMeterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  progressMeterWrap: {
    flex: 1,
  },
  progressRail: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressPercentLabel: {
    minWidth: 42,
    textAlign: "right",
    fontSize: 26,
    fontWeight: "900",
    color: "#2ecc71",
    lineHeight: 30,
  },
  closedState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D7CFC2",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  closedStateTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  closedStateDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#4B5563",
  },
  actionCard: {
    backgroundColor: "#1c7c43",
    borderRadius: 20,
    borderWidth: 0,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    marginBottom: 12,
    shadowColor: "#1c7c43",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },
  actionCardPressed: {
    transform: [{ scale: 0.995 }],
    opacity: 0.95,
  },
  actionCardLabel: {
    flex: 1,
    fontSize: 21,
    lineHeight: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  actionCardLeftIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    flexShrink: 0,
  },
  actionCardPlus: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "900",
    color: "#1c7c43",
    marginTop: -1,
  },
  actionCardArrow: {
    fontSize: 26,
    lineHeight: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    flexShrink: 0,
  },
  utilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  utilityPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7D2C9",
  },
  utilityPillPressed: {
    opacity: 0.8,
  },
  utilityPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  registerArea: {
    flex: 1,
    minHeight: 0,
    marginBottom: 10,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#DDD7CB",
    backgroundColor: "#F7F3EC",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 12,
  },
  bottomNavItemPressed: {
    backgroundColor: "#EEE7DC",
  },
  bottomNavLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  bottomNavLabelActive: {
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F0ECE5",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E1D9CC",
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipActive: {
    backgroundColor: "#F6F2EA",
    borderColor: "#111827",
    borderWidth: 1.5,
  },
  chipText: {
    color: "#111827",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 12,
    color: "#111827",
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarHeaderArrow: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    paddingHorizontal: 8,
  },
  calendarWeekdays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calendarWeekday: {
    width: 34,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  calendarCell: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3EEE6",
  },
  calendarCellPressed: {
    opacity: 0.8,
  },
  calendarCellSelected: {
    backgroundColor: "#111827",
  },
  calendarCellText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1F2937",
  },
  calendarCellTextSelected: {
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontWeight: "700",
    color: "#374151",
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#111827",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPrimaryText: {
    fontWeight: "800",
    color: "#fff",
  },
  deleteButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DC2626",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontWeight: "800",
    color: "#DC2626",
  },
});

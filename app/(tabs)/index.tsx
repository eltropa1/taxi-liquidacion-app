import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { TripHistory } from "../../src/components/trip-history";
import {
  CompleteServiceFlowController,
  type CompleteServiceFlowControllerHandle,
} from "../../src/components/trips/CompleteServiceFlowController";
import { PaymentType, TripSource } from "../../src/constants/enums";
import { useTodayScreen } from "../../src/hooks/useTodayScreen";
import { useHomeDateTracking } from "../../src/hooks/useHomeDateTracking";
import { useTripActions } from "../../src/hooks/useTripActions";
import {
  buildTodayScreenProjection,
  resolveStaleOperationalState,
  toTripVisualProjection,
  type TripVisualProjection,
} from "../../src/presentation";
import { UpdateWorkday } from "../../src/application/workdays/UpdateWorkday";
import {
  parsePositiveIntegerInput,
  validateWorkdayOdometers,
} from "../../src/domain/workdays/workdayOdometer";
import {
  useSignatureTokens,
  type SignatureTokens,
} from "../../src/presentation/signature/geo-taxi-signature-tokens";
import { useAppTheme } from "../../src/presentation/theme/ThemeProvider";

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

function formatElapsedDuration(startedAt: string | null | undefined, now: number) {
  if (!startedAt) return null;
  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return null;
  const elapsedMinutes = Math.max(0, Math.floor((now - startMs) / 60000));
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function useElapsedClock(isRunning: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isRunning) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, [isRunning]);

  return now;
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
  trackColor,
}: {
  percent: number;
  color: string;
  trackColor: string;
}) {
  const animatedPercent = useRef(new Animated.Value(percent)).current;
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotionEnabled(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotionEnabled,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // motion-base (200-250ms) con ease-in-out — ver GeoTaxi Motion and
    // Microinteractions v1.0 §2-3. Instantáneo si el sistema pide reducir movimiento.
    Animated.timing(animatedPercent, {
      toValue: percent,
      duration: reduceMotionEnabled ? 0 : 220,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [percent, reduceMotionEnabled, animatedPercent]);

  const width = animatedPercent.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View
      style={{
        height: 12,
        backgroundColor: trackColor,
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          height: "100%",
          borderRadius: 999,
          width,
          backgroundColor: color,
        }}
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
  const signature = useSignatureTokens();
  const { shadowCard } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(signature, shadowCard), [signature, shadowCard]);
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
    activeTripStartTime,
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

  const [isActionPending, setIsActionPending] = useState(false);

  const handleActionPress = () => {
    if (isActionPending) return;
    setIsActionPending(true);
    Promise.resolve(actionHandler())
      .catch((error) => {
        console.error("Error ejecutando la acción principal", error);
        Alert.alert(
          "No se ha podido completar la acción",
          error instanceof Error
            ? error.message
            : "Inténtalo de nuevo.",
        );
      })
      .finally(() => {
        setIsActionPending(false);
      });
  };

  const handlePendingTripPress = useCallback(
    (trip: TripVisualProjection) => {
      completeServiceFlowRef.current?.openForPendingService({
        tripId: trip.id,
        payment: lastPayment,
        source: platformIdToTripSource(trip.platform.id),
      });
    },
    [lastPayment],
  );

  const handleRegisteredTripPress = useCallback((tripId: number) => {
    router.push({
      pathname: "/trip/edit",
      params: { tripId },
    });
  }, []);

  const contextStartTime = workdayInfo?.startTime ?? activeWorkday?.startTime ?? null;
  const isViewingToday = isSameDay(selectedDate, new Date());
  const isWorkedTimeLive = hasActiveWorkday && isViewingToday;
  const elapsedClockNow = useElapsedClock(isWorkedTimeLive);
  const workedTimeLabel = isWorkedTimeLive
    ? formatElapsedDuration(contextStartTime, elapsedClockNow)
    : null;

  const warnedStaleTripIdRef = useRef<number | null>(null);
  const warnedStaleWorkdayIdRef = useRef<number | null>(null);

  useEffect(() => {
    const { staleTrip, staleWorkday } = resolveStaleOperationalState({
      activeTrip:
        activeTripId !== null && activeTripStartTime
          ? { id: activeTripId, startTime: activeTripStartTime }
          : null,
      activeWorkday: activeWorkday
        ? { id: activeWorkday.id, startTime: activeWorkday.startTime }
        : null,
      now: new Date(),
    });

    if (staleTrip && warnedStaleTripIdRef.current !== staleTrip.id) {
      warnedStaleTripIdRef.current = staleTrip.id;
      Alert.alert(
        "Viaje en curso desde otro día",
        `Tienes un viaje sin finalizar iniciado el ${new Date(
          staleTrip.startTime,
        ).toLocaleString()}. Finalízalo para que las cifras de hoy sean correctas.`,
      );
    }

    if (staleWorkday && warnedStaleWorkdayIdRef.current !== staleWorkday.id) {
      warnedStaleWorkdayIdRef.current = staleWorkday.id;
      Alert.alert(
        "Jornada abierta desde otro día",
        `Tienes una jornada sin cerrar abierta el ${new Date(
          staleWorkday.startTime,
        ).toLocaleDateString()}. Ciérrala para poder llevar bien la cuenta de hoy.`,
      );
    }
  }, [activeTripId, activeTripStartTime, activeWorkday]);

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

  const handleSaveWorkday = () => {
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

      // Camino de respuesta instantánea: el modal se cierra al toque y la
      // apertura de jornada continúa en segundo plano.
      closeWorkdayModal();
      handleOpenWorkday(startOdometer).catch((error) => {
        console.error("Error abriendo jornada", error);
        Alert.alert(
          "No se ha podido abrir la jornada",
          error instanceof Error ? error.message : "Inténtalo de nuevo.",
        );
      });
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

      closeWorkdayModal();
      handleCloseWorkday(endOdometer).catch((error) => {
        console.error("Error cerrando jornada", error);
        Alert.alert("No se ha podido cerrar la jornada", "Inténtalo de nuevo.");
      });
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

    closeWorkdayModal();
    UpdateWorkday.execute({
      id: editingWorkdayId,
      startOdometer,
      endOdometer,
    })
      .then(() => refreshData())
      .catch((error) => {
        console.error("Error actualizando jornada", error);
        Alert.alert("No se ha podido actualizar la jornada", "Inténtalo de nuevo.");
      });
  };

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

              {workedTimeLabel ? (
                <Text style={styles.contextWorkedTime}>
                  Trabajado {workedTimeLabel}
                </Text>
              ) : null}

              {workdayInfo?.id != null ? (
                <Pressable
                  hitSlop={8}
                  onPress={() => openWorkdayModal("edit")}
                  accessibilityRole="button"
                  accessibilityLabel="Corregir odómetros de la jornada"
                  style={({ pressed }) => [
                    styles.contextEditOdometerButton,
                    pressed && styles.contextEditOdometerButtonPressed,
                  ]}
                >
                  <MaterialIcons
                    name="edit"
                    size={14}
                    color={signature.colors.ink}
                  />
                  <Text style={styles.contextEditOdometerText}>Odómetros</Text>
                </Pressable>
              ) : null}
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
                <MaterialIcons name="calendar-today" size={16} color={signature.colors.green} />
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

              {!isLatestAvailableDate ? (
                <Pressable
                  hitSlop={6}
                  onPress={goToToday}
                  accessibilityRole="button"
                  accessibilityLabel="Volver a hoy"
                  style={({ pressed }) => [
                    styles.todayButton,
                    pressed && styles.todayButtonPressed,
                  ]}
                >
                  <Text style={styles.todayButtonText}>Hoy</Text>
                </Pressable>
              ) : null}
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

        <View style={styles.operationalStackContent}>
            {hasOperationalContext && (
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
                        color={signature.colors.green}
                        trackColor={signature.colors.surfaceMuted}
                      />
                    </View>
                    <Text style={styles.progressPercentLabel}>
                      {progressPercent === null
                        ? "0%"
                        : `${Math.round(progressPercent)}%`}
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
              disabled={isActionPending}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
                isActionPending && styles.actionCardDisabled,
              ]}
            >
              <View style={styles.actionCardLeftIcon}>
                <Text style={styles.actionCardPlus}>+</Text>
              </View>
              <Text style={styles.actionCardLabel}>{actionLabel}</Text>
              <Text style={styles.actionCardArrow}>›</Text>
            </Pressable>

            <View style={styles.registerArea}>
              <Text style={styles.registerAreaTitle}>Historial operativo</Text>
              <View style={styles.registerAreaPanel}>
                <TripHistory
                  trips={tripHistoryProjections}
                  onPendingTripPress={handlePendingTripPress}
                  onRegisteredTripPress={handleRegisteredTripPress}
                  contentBottomPadding={Math.max(insets.bottom, 16) + 112}
                />
              </View>
            </View>
        </View>
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

function createStyles(signature: SignatureTokens, shadowCard: ReturnType<typeof useAppTheme>["shadowCard"]) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: signature.colors.background,
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
    color: signature.colors.ink,
    flexShrink: 1,
  },
  contextStart: {
    fontSize: 13,
    fontWeight: "700",
    color: signature.colors.inkSoft,
  },
  contextWorkedTime: {
    fontSize: 13,
    fontWeight: "700",
    color: signature.colors.green,
    fontVariant: ["tabular-nums"],
  },
  contextCalendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: signature.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  contextCalendarButtonPressed: {
    opacity: 0.75,
  },
  contextEditOdometerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 10,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: signature.colors.surfaceMuted,
  },
  contextEditOdometerButtonPressed: {
    opacity: 0.75,
  },
  contextEditOdometerText: {
    fontSize: 11,
    fontWeight: "600",
    color: signature.colors.ink,
  },
  todayButton: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: signature.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  todayButtonPressed: {
    opacity: 0.75,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: signature.colors.green,
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
    color: signature.colors.ink,
    paddingHorizontal: 12,
  },
  dateNavigatorArrowDisabled: {
    color: signature.colors.border,
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
    color: signature.colors.inkSoft,
    letterSpacing: 0.3,
  },
  contextBarBottomAction: {
    flexShrink: 0,
    alignItems: "flex-end",
  },
  contextCloseWorkdayButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: signature.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  contextCloseWorkdayButtonPressed: {
    opacity: 0.75,
  },
  contextCloseWorkdayText: {
    fontSize: 12,
    fontWeight: "700",
    color: signature.colors.inkSoft,
  },
  operationalStackContent: {
    flex: 1,
    gap: 12,
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
    color: signature.colors.green,
    textTransform: "uppercase",
  },
  progressAmount: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "600",
    color: signature.colors.ink,
    flexShrink: 1,
  },
  progressTopLine: {
    fontSize: 13,
    fontWeight: "700",
    color: signature.colors.ink,
    textAlign: "left",
    flexWrap: "nowrap",
  },
  progressTopLabel: {
    color: signature.colors.inkSoft,
  },
  progressTopGoal: {
    color: signature.colors.green,
  },
  progressTopRemaining: {
    color: signature.colors.inkSoft,
  },
  progressTopReached: {
    color: signature.colors.ink,
    fontWeight: "800",
  },
  progressTopSpacer: {
    color: signature.colors.ink,
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
  progressPercentLabel: {
    minWidth: 42,
    textAlign: "right",
    fontSize: 17,
    fontWeight: "700",
    color: signature.colors.green,
    lineHeight: 22,
  },
  closedState: {
    backgroundColor: signature.colors.surface,
    borderRadius: signature.radii.card,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: signature.colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  closedStateTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: signature.colors.ink,
  },
  closedStateDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: signature.colors.inkSoft,
  },
  actionCard: {
    backgroundColor: signature.colors.green,
    borderRadius: signature.radii.card,
    borderWidth: 0,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    marginBottom: 12,
    ...shadowCard,
  },
  actionCardPressed: {
    transform: [{ scale: 0.995 }],
    opacity: 0.95,
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  actionCardLabel: {
    flex: 1,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "700",
    color: signature.colors.surface,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  actionCardLeftIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: signature.colors.surface,
    flexShrink: 0,
  },
  actionCardPlus: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "700",
    color: signature.colors.green,
    marginTop: -1,
  },
  actionCardArrow: {
    fontSize: 26,
    lineHeight: 26,
    fontWeight: "700",
    color: signature.colors.surface,
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
    backgroundColor: signature.colors.surface,
    borderWidth: 1,
    borderColor: signature.colors.border,
  },
  utilityPillPressed: {
    opacity: 0.8,
  },
  utilityPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: signature.colors.inkSoft,
  },
  registerArea: {
    flex: 1,
    minHeight: 0,
    marginBottom: 10,
  },
  registerAreaTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: signature.colors.inkSoft,
    marginBottom: 8,
  },
  registerAreaPanel: {
    flex: 1,
    minHeight: 0,
    backgroundColor: signature.colors.surface,
    borderRadius: signature.radii.card,
    borderWidth: 1,
    borderColor: signature.colors.border,
    paddingHorizontal: 12,
    paddingTop: 8,
    overflow: "hidden",
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
    backgroundColor: signature.colors.surfaceMuted,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: signature.colors.border,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipActive: {
    backgroundColor: signature.colors.background,
    borderColor: signature.colors.ink,
    borderWidth: 1.5,
  },
  chipText: {
    color: signature.colors.ink,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: signature.colors.surface,
    borderRadius: signature.radii.card,
    padding: 18,
  },
  modalTitle: {
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 12,
    color: signature.colors.ink,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarHeaderArrow: {
    fontSize: 20,
    fontWeight: "700",
    color: signature.colors.ink,
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
    color: signature.colors.inkSoft,
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
    backgroundColor: signature.colors.surfaceMuted,
  },
  calendarCellPressed: {
    opacity: 0.8,
  },
  calendarCellSelected: {
    backgroundColor: signature.colors.ink,
  },
  calendarCellText: {
    fontSize: 13,
    fontWeight: "800",
    color: signature.colors.ink,
  },
  calendarCellTextSelected: {
    color: signature.colors.surface,
  },
  input: {
    borderWidth: 1,
    borderColor: signature.colors.border,
    padding: 10,
    borderRadius: signature.radii.card,
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
    borderColor: signature.colors.border,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontWeight: "700",
    color: signature.colors.inkSoft,
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: signature.colors.ink,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPrimaryText: {
    fontWeight: "800",
    color: signature.colors.surface,
  },
  deleteButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: signature.colors.danger,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontWeight: "800",
    color: signature.colors.danger,
  },
  });
}

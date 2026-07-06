import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExportService } from "../../src/application/runtime";
import { useTripActions } from "../../src/hooks/useTripActions";
import { PaymentType, TripSource } from "../../src/constants/enums";
import { useTodayScreen, type TodayTripRow } from "../../src/hooks/useTodayScreen";
import { TripHistory } from "../../src/components/trip-history";
import {
  buildTodayScreenProjection,
  toTripVisualProjection,
} from "../../src/presentation";
import { addCalendarDays } from "../../src/utils/dateUtils";
import {
  parsePositiveIntegerInput,
  validateWorkdayOdometers,
} from "../../src/domain/workdays/workdayOdometer";

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} €`;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTimeLabel(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProgressPercent(current: number, goal: number) {
  if (goal <= 0) return null;
  return (current / goal) * 100;
}

function clampPercent(percent: number | null) {
  if (percent === null) return 0;
  return Math.min(percent, 100);
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function KeyValueRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.keyValueRow}>
      <Text style={styles.keyValueLabel}>{label}</Text>
      <Text style={styles.keyValueValue}>{value}</Text>
    </View>
  );
}

function ProgressBar({
  percent,
}: {
  percent: number;
}) {
  return (
    <View style={styles.progressRail}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${percent}%`,
          },
        ]}
      />
    </View>
  );
}

type WorkdayModalMode = "open" | "close" | null;

export default function SummaryScreen() {
  const [lastPayment, setLastPayment] = useState<PaymentType>(PaymentType.CASH);
  const [lastSource, setLastSource] = useState<TripSource>(TripSource.TAXI);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingTrip, setEditingTrip] = useState<TodayTripRow | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [payment, setPayment] = useState<PaymentType>(PaymentType.CASH);
  const [source, setSource] = useState<TripSource>(TripSource.TAXI);
  const [customSource, setCustomSource] = useState("");
  const [chargedAmountInput, setChargedAmountInput] = useState("");
  const [cashTipInput, setCashTipInput] = useState("");
  const [workdayModalMode, setWorkdayModalMode] =
    useState<WorkdayModalMode>(null);
  const [workdayStartOdometerInput, setWorkdayStartOdometerInput] =
    useState("");
  const [workdayEndOdometerInput, setWorkdayEndOdometerInput] = useState("");

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
    handleSaveTrip,
    handleDeleteTrip,
    handleOpenWorkday,
    handleCloseWorkday,
  } = useTripActions({
    refreshData,
    setLastPayment,
    setLastSource,
    setEditingTrip,
    setShowFinishModal,
    setAmountInput,
    setCustomSource,
  });

  const tripHistoryProjections = useMemo(
    () => trips.map((trip) => toTripVisualProjection(trip)),
    [trips],
  );

  const paymentRows = useMemo(
    () =>
      [
        {
          label: "Efectivo",
          count: trips.filter((trip) => trip.payment === PaymentType.CASH).length,
          amount: dailySummary?.efectivo ?? null,
        },
        {
          label: "Tarjeta",
          count: trips.filter((trip) => trip.payment === PaymentType.CARD).length,
          amount: dailySummary?.tarjeta ?? null,
        },
        {
          label: "App",
          count: trips.filter((trip) => trip.payment === PaymentType.APP).length,
          amount: dailySummary?.app ?? null,
        },
      ],
    [dailySummary?.app, dailySummary?.efectivo, dailySummary?.tarjeta, trips],
  );

  const projection = useMemo(
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
  const hasActiveTrip = Boolean(activeTripId);
  const progressPercent = getProgressPercent(projection.totalToday, goals.daily);
  const progressFill = clampPercent(progressPercent);
  const remainingDaily = Math.max(goals.daily - projection.totalToday, 0);
  const remainingWeekly = projection.remainingWeekly;
  const remainingMonthly = projection.remainingMonthly;

  const primaryActionLabel = !hasActiveWorkday
    ? "Abrir jornada"
    : hasActiveTrip
      ? "Finalizar viaje"
      : "Cerrar jornada";

  const primaryActionHandler = !hasActiveWorkday
    ? () => openWorkdayModal("open")
    : hasActiveTrip
      ? handleOpenFinish
      : () => openWorkdayModal("close");

  function handleOpenFinish() {
    setEditingTrip(null);
    setPayment(lastPayment);
    setSource(lastSource);
    setCustomSource("");
    setAmountInput("");
    setShowFinishModal(true);
    setChargedAmountInput("");
    setCashTipInput("");
  }

  const handleOpenManualTrip = () => {
    if (!hasActiveWorkday) return;

    setEditingTrip({
      id: -1,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      amount: null,
      payment: PaymentType.CASH,
      source: TripSource.TAXI,
    } as any);
    setAmountInput("");
    setPayment(PaymentType.CASH);
    setSource(TripSource.TAXI);
    setCustomSource("");
    setShowFinishModal(true);
  };

  function openWorkdayModal(mode: WorkdayModalMode) {
    setWorkdayModalMode(mode);
    if (mode === "open") {
      setWorkdayStartOdometerInput("");
      setWorkdayEndOdometerInput("");
      return;
    }

    setWorkdayStartOdometerInput("");
    setWorkdayEndOdometerInput(
      workdayInfo?.endOdometer !== null && workdayInfo?.endOdometer !== undefined
        ? String(workdayInfo.endOdometer)
        : "",
    );
  }

  const closeWorkdayModal = () => {
    setWorkdayModalMode(null);
    setWorkdayStartOdometerInput("");
    setWorkdayEndOdometerInput("");
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

    const validation = validateWorkdayOdometers(null, endOdometer);
    if (!validation.ok) {
      Alert.alert(
        "Odómetro final inválido",
        "Introduce un odómetro final válido.",
      );
      return;
    }

    await handleCloseWorkday(endOdometer);
    closeWorkdayModal();
  };

  const handleSave = async () => {
    await handleSaveTrip({
      editingTrip,
      amountInput,
      payment,
      chargedAmountInput,
      cashTipInput,
      source,
      customSource,
    });
  };

  const handleDelete = async () => {
    await handleDeleteTrip({ editingTrip });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Resumen diario</Text>
          <Text style={styles.title}>Revisión antes del cierre</Text>
          <Text style={styles.subtitle}>
            ¿Está todo correcto antes de cerrar la jornada?
          </Text>
        </View>

        <View style={styles.dateBar}>
          <Pressable
            onPress={() =>
              setSelectedDate((current) => addCalendarDays(current, -1))
            }
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>‹</Text>
          </Pressable>

          <Text style={styles.dateLabel}>{formatDateLabel(selectedDate)}</Text>

          <Pressable
            onPress={() =>
              setSelectedDate((current) => addCalendarDays(current, 1))
            }
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>›</Text>
          </Pressable>
        </View>

        <SummaryCard title="Estado de la jornada">
          <KeyValueRow
            label="Contexto"
            value={
              hasActiveWorkday
                ? "Jornada abierta"
                : projection.resolvedWorkdayInfo.isVirtual
                  ? "Sin jornada registrada"
                  : "Jornada cerrada"
            }
          />
          <KeyValueRow
            label="Inicio"
            value={formatTimeLabel(
              activeWorkday?.startTime ?? projection.resolvedWorkdayInfo.startTime,
            )}
          />
          <KeyValueRow
            label="Fin"
            value={formatTimeLabel(projection.resolvedWorkdayInfo.endTime)}
          />
          <KeyValueRow
            label="Odómetro inicial"
            value={
              projection.resolvedWorkdayInfo.startOdometer === null
                ? "—"
                : String(projection.resolvedWorkdayInfo.startOdometer)
            }
          />
          <KeyValueRow
            label="Odómetro final"
            value={
              projection.resolvedWorkdayInfo.endOdometer === null
                ? "—"
                : String(projection.resolvedWorkdayInfo.endOdometer)
            }
          />
          <KeyValueRow
            label="Kilómetros trabajados"
            value={
              projection.resolvedWorkdayInfo.workedKilometers === null
                ? "—"
                : `${projection.resolvedWorkdayInfo.workedKilometers} km`
            }
          />
          {hasActiveTrip && (
            <Text style={styles.notice}>
              Hay un viaje activo. Debe finalizarse antes de cerrar la jornada.
            </Text>
          )}
        </SummaryCard>

        <SummaryCard title="Recaudación del día">
          <View style={styles.heroMetric}>
            <Text style={styles.heroLabel}>Recaudación</Text>
            <Text style={styles.heroValue}>{formatMoney(projection.totalToday)}</Text>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressMeta}>
              Objetivo {formatMoney(goals.daily)} · Restan {formatMoney(remainingDaily)}
            </Text>
            {progressPercent !== null && progressPercent >= 100 ? (
              <Text style={styles.goalReached}>Objetivo alcanzado</Text>
            ) : null}
          </View>
          {progressPercent !== null && <ProgressBar percent={progressFill} />}
          {progressPercent !== null && (
            <Text style={styles.progressPercent}>
              {progressPercent.toFixed(0)}%
            </Text>
          )}

          <View style={styles.inlineMetrics}>
            <KeyValueRow
              label="Total de servicios"
              value={String(dailySummary?.servicesTotal ?? trips.length)}
            />
            <KeyValueRow
              label="Servicios finalizados"
              value={String(trips.filter((trip) => trip.endTime !== null).length)}
            />
          </View>
        </SummaryCard>

        <SummaryCard title="Resumen por plataforma">
          {[
            { label: "Taxi", services: dailySummary?.servicesTaxi, amount: dailySummary?.taxi },
            { label: "Uber", services: dailySummary?.servicesUber, amount: dailySummary?.uber },
            { label: "Cabify", services: dailySummary?.servicesCabify, amount: dailySummary?.cabify },
            { label: "FreeNow", services: dailySummary?.servicesFreeNow, amount: dailySummary?.freeNow },
            { label: "Otros", services: dailySummary?.servicesOther, amount: null },
          ].map((item) => (
            <View key={item.label} style={styles.platformRow}>
              <Text style={styles.platformLabel}>{item.label}</Text>
              <Text style={styles.platformCount}>
                {item.services ?? 0} servicios
              </Text>
              <Text style={styles.platformAmount}>
                {item.amount === null ? "—" : formatMoney(item.amount)}
              </Text>
            </View>
          ))}
        </SummaryCard>

        <SummaryCard title="Resumen por método de cobro">
          {paymentRows.map((item) => (
            <View key={item.label} style={styles.platformRow}>
              <Text style={styles.platformLabel}>{item.label}</Text>
              <Text style={styles.platformCount}>{item.count} servicios</Text>
              <Text style={styles.platformAmount}>
                {item.amount === null ? "—" : formatMoney(item.amount)}
              </Text>
            </View>
          ))}
          <View style={styles.tipBlock}>
            <Text style={styles.tipTitle}>Propinas</Text>
            <KeyValueRow
              label="Tarjeta"
              value={formatMoney(dailySummary?.propinaTarjeta)}
            />
            <KeyValueRow
              label="Efectivo"
              value={formatMoney(dailySummary?.propinaEfectivo)}
            />
          </View>
        </SummaryCard>

        <SummaryCard title="Resumen semanal y mensual">
          <View style={styles.compareHeader}>
            <Text style={styles.compareLabel} />
            <Text style={styles.compareLabel}>Semana</Text>
            <Text style={styles.compareLabel}>Mes</Text>
          </View>

          {[
            ["Total", "total"],
            ["Taxi", "taxi"],
            ["Uber", "uber"],
            ["Cabify", "cabify"],
            ["FreeNow", "freeNow"],
            ["Efectivo", "efectivo"],
            ["Tarjeta", "tarjeta"],
            ["App", "app"],
          ].map(([label, key]) => (
            <View key={key} style={styles.compareRow}>
              <Text style={styles.compareMetricLabel}>{label}</Text>
              <Text style={styles.compareMetricValue}>
                {weeklySummary?.[key] !== undefined
                  ? formatMoney(weeklySummary[key])
                  : "—"}
              </Text>
              <Text style={styles.compareMetricValue}>
                {monthlySummary?.[key] !== undefined
                  ? formatMoney(monthlySummary[key])
                  : "—"}
              </Text>
            </View>
          ))}

          <View style={styles.goalGrid}>
            <KeyValueRow
              label="Objetivo diario"
              value={`${formatMoney(goals.daily)} · restan ${formatMoney(remainingDaily)}`}
            />
            <KeyValueRow
              label="Objetivo semanal"
              value={
                weeklySummary?.total !== undefined
                  ? `${formatMoney(weeklySummary.total)} · restan ${formatMoney(remainingWeekly)}`
                  : "—"
              }
            />
            <KeyValueRow
              label="Objetivo mensual"
              value={
                monthlySummary?.total !== undefined
                  ? `${formatMoney(monthlySummary.total)} · restan ${formatMoney(remainingMonthly)}`
                  : "—"
              }
            />
          </View>
        </SummaryCard>

        <SummaryCard title="Historial operativo">
          <TripHistory
            trips={tripHistoryProjections}
            onTripPress={(tripId) =>
              router.push({
                pathname: "/trip/edit",
                params: { tripId },
              })
            }
          />
        </SummaryCard>

        <SummaryCard title="Acciones">
          <View style={styles.actionStack}>
            <Pressable style={styles.primaryAction} onPress={primaryActionHandler}>
              <Text style={styles.primaryActionText}>{primaryActionLabel}</Text>
            </Pressable>

            <View style={styles.secondaryActions}>
              {hasActiveWorkday && (
                <Pressable style={styles.secondaryAction} onPress={handleOpenManualTrip}>
                  <Text style={styles.secondaryActionText}>Añadir viaje manual</Text>
                </Pressable>
              )}

              {workdayInfo && (
                <Pressable
                  style={styles.secondaryAction}
                  onPress={() => openWorkdayModal("close")}
                >
                  <Text style={styles.secondaryActionText}>Cerrar jornada</Text>
                </Pressable>
              )}

              {workdayInfo && (
                <Pressable
                  style={styles.secondaryAction}
                  onPress={() => openWorkdayModal("open")}
                >
                  <Text style={styles.secondaryActionText}>Abrir jornada</Text>
                </Pressable>
              )}

              <Pressable
                style={styles.secondaryAction}
                onPress={() => ExportService.exportTripsToCSV()}
              >
                <Text style={styles.secondaryActionText}>Exportar CSV</Text>
              </Pressable>
            </View>
          </View>
        </SummaryCard>

        <View style={styles.footer}>
          <Pressable onPress={() => router.push("/")} style={styles.backLink}>
            <Text style={styles.backLinkText}>Volver a la Home</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showFinishModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingTrip ? "Editar viaje" : "Finalizar viaje"}
            </Text>

            <Text>Importe del viaje (€)</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="decimal-pad"
              placeholder="0,00"
              autoFocus
              style={styles.input}
            />

            {payment === PaymentType.CARD && (
              <>
                <Text style={{ marginTop: 10 }}>Importe cobrado (€)</Text>
                <TextInput
                  value={chargedAmountInput}
                  onChangeText={setChargedAmountInput}
                  keyboardType="decimal-pad"
                  placeholder={amountInput || "0,00"}
                  style={styles.input}
                />
              </>
            )}

            {payment === PaymentType.CASH && (
              <>
                <Text style={{ marginTop: 10 }}>Importe cobrado (€)</Text>
                <TextInput
                  value={cashTipInput}
                  onChangeText={setCashTipInput}
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  style={styles.input}
                />
              </>
            )}

            <Text style={{ marginTop: 10 }}>Forma de pago</Text>
            <View style={styles.chipRow}>
              {[PaymentType.CASH, PaymentType.CARD, PaymentType.APP].map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPayment(p)}
                  style={[styles.chip, payment === p && styles.chipActive]}
                >
                  <Text>{p}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ marginTop: 10 }}>Tipo de viaje</Text>
            <View style={styles.chipRow}>
              {[TripSource.TAXI, TripSource.UBER, TripSource.CABIFY, TripSource.FREE_NOW].map(
                (s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSource(s)}
                    style={[styles.chip, source === s && styles.chipActive]}
                  >
                    <Text>{s}</Text>
                  </Pressable>
                ),
              )}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setEditingTrip(null);
                  setShowFinishModal(false);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable onPress={handleSave} style={styles.modalButtonPrimary}>
                <Text style={styles.modalButtonPrimaryText}>Guardar</Text>
              </Pressable>
            </View>

            {editingTrip && (
              <View style={{ marginTop: 10 }}>
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Borrar viaje",
                      "Esta acción no se puede deshacer.\n\n¿Seguro que quieres borrar este viaje?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Borrar",
                          style: "destructive",
                          onPress: handleDelete,
                        },
                      ],
                    );
                  }}
                  style={styles.dangerButton}
                >
                  <Text style={styles.dangerButtonText}>Borrar viaje</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={workdayModalMode !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {workdayModalMode === "open"
                ? "Abrir jornada"
                : "Cerrar jornada"}
            </Text>

            {workdayModalMode === "open" ? (
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
            ) : (
              <>
                <Text>Odómetro final</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f1eb",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  header: {
    gap: 4,
    paddingBottom: 4,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#6e6457",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1f1a17",
  },
  subtitle: {
    fontSize: 14,
    color: "#5f564d",
    lineHeight: 20,
  },
  dateBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  dateButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e9e2d8",
    alignItems: "center",
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2b2521",
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b2521",
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(31, 26, 23, 0.08)",
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1f1a17",
    marginBottom: 2,
  },
  keyValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  keyValueLabel: {
    fontSize: 13,
    color: "#6e6457",
    flex: 1,
  },
  keyValueValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#231d1a",
    textAlign: "right",
    flexShrink: 0,
  },
  notice: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#8b4f24",
    backgroundColor: "#fff6e8",
    padding: 10,
    borderRadius: 12,
  },
  heroMetric: {
    paddingVertical: 4,
    gap: 2,
  },
  heroLabel: {
    fontSize: 13,
    color: "#6e6457",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#181311",
  },
  progressHeader: {
    gap: 4,
  },
  progressMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4d463f",
  },
  goalReached: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1c7c43",
  },
  progressRail: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "#e7dfd5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#7b5fff",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6e6457",
    alignSelf: "flex-end",
  },
  inlineMetrics: {
    gap: 8,
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(31, 26, 23, 0.12)",
  },
  platformLabel: {
    width: 76,
    fontSize: 13,
    fontWeight: "700",
    color: "#1f1a17",
  },
  platformCount: {
    flex: 1,
    fontSize: 13,
    color: "#5f564d",
  },
  platformAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#231d1a",
    textAlign: "right",
  },
  tipBlock: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(31, 26, 23, 0.12)",
    gap: 8,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#231d1a",
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(31, 26, 23, 0.12)",
  },
  compareLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: "#6e6457",
    textAlign: "right",
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(31, 26, 23, 0.08)",
  },
  compareMetricLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#1f1a17",
  },
  compareMetricValue: {
    flex: 1,
    fontSize: 13,
    color: "#231d1a",
    textAlign: "right",
  },
  goalGrid: {
    gap: 8,
    paddingTop: 8,
  },
  actionStack: {
    gap: 12,
  },
  primaryAction: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#1f1a17",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  secondaryAction: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#ece5da",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2b2521",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 8,
  },
  backLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6e6457",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f1a17",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8d0c5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f1a17",
    backgroundColor: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#eee6da",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2b2521",
  },
  modalButtonPrimary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#1f1a17",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPrimaryText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },
  dangerButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#ffe8e8",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#b42318",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#eee6da",
  },
  chipActive: {
    backgroundColor: "#d8ccb8",
  },
});

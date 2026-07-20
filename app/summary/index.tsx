import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExportService } from "../../src/application/runtime";
import { CompleteServiceFlowController } from "../../src/components/trips/CompleteServiceFlowController";
import { TripHistoryEmptyState } from "../../src/components/trip-history/TripHistoryEmptyState";
import { TripHistoryRow } from "../../src/components/trip-history/TripHistoryRow";
import { PaymentType, TripSource } from "../../src/constants/enums";
import { useSummaryScreen } from "../../src/hooks/useSummaryScreen";
import { useTripActions } from "../../src/hooks/useTripActions";
import {
  buildSummaryScreenProjection,
  type SummaryDrilldownGroup,
  type TripVisualProjection,
} from "../../src/presentation";
import { SummaryDrilldownSheet } from "../../src/components/summary/SummaryDrilldownSheet";
import {
  parsePositiveIntegerInput,
} from "../../src/domain/workdays/workdayOdometer";
import type { CompleteServiceFlowControllerHandle } from "../../src/components/trips/CompleteServiceFlowController";
import { addCalendarDays } from "../../src/utils/dateUtils";

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} €`;
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
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

function parseSelectedDate(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return new Date();

  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
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

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionTitleBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function MetricRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricRowText}>
        <Text style={styles.metricLabel}>{label}</Text>
        {detail ? <Text style={styles.metricDetail}>{detail}</Text> : null}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function DrilldownRow({
  group,
  onPress,
}: {
  group: SummaryDrilldownGroup;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.drilldownRow, pressed && styles.pressed]}
    >
      <View style={styles.drilldownText}>
        <Text style={styles.drilldownTitle}>{group.title}</Text>
        <Text style={styles.drilldownSubtitle}>{group.subtitle}</Text>
      </View>

      <View style={styles.drilldownMeta}>
        <Text style={styles.drilldownCount}>{group.count}</Text>
        <Text style={styles.drilldownAmount}>{formatMoney(group.amount)}</Text>
        <Text style={styles.drilldownChevron}>›</Text>
      </View>
    </Pressable>
  );
}

export default function SummaryScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const [selectedDate, setSelectedDate] = useState(() => parseSelectedDate(params.date));
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(parseSelectedDate(params.date)),
  );

  const [lastPayment, setLastPayment] = useState<PaymentType>(PaymentType.CASH);
  const [, setLastSource] = useState<TripSource>(TripSource.TAXI);
  const [selectedGroup, setSelectedGroup] = useState<SummaryDrilldownGroup | null>(null);
  const [showCloseWorkdayModal, setShowCloseWorkdayModal] = useState(false);
  const [endOdometerInput, setEndOdometerInput] = useState("");

  const {
    workdayInfo,
    activeWorkday,
    trips,
    dailySummary,
    refreshData,
  } = useSummaryScreen(selectedDate);

  const { handleCloseWorkday } = useTripActions({
    refreshData,
    setLastPayment,
    setLastSource,
  });

  const completeServiceFlowRef = useRef<
    CompleteServiceFlowControllerHandle | null
  >(null);

  const projection = useMemo(
    () =>
      buildSummaryScreenProjection({
        selectedDate,
        currentTime,
        workdayInfo,
        activeWorkday,
        trips,
        dailySummary,
      }),
    [activeWorkday, dailySummary, currentTime, selectedDate, trips, workdayInfo],
  );

  useEffect(() => {
    const nextSelectedDate = parseSelectedDate(params.date);
    setSelectedDate(nextSelectedDate);
    setCalendarMonth(startOfMonth(nextSelectedDate));
  }, [params.date]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSelectedGroup(null);
  }, [selectedDate]);

  const openGroups = selectedGroup?.trips ?? [];
  const hasOpenWorkday = projection.statusLabel === "ABIERTA";
  const canExportWorkday = projection.workdayId !== null;
  const isLatestAvailableDate = isSameDay(selectedDate, new Date());

  const openDrilldown = (group: SummaryDrilldownGroup) => {
    setSelectedGroup(group);
  };

  const closeDrilldown = () => {
    setSelectedGroup(null);
  };

  const openPendingService = (trip: TripVisualProjection) => {
    completeServiceFlowRef.current?.openForPendingService({
      tripId: trip.id,
      payment: lastPayment,
      source: platformIdToTripSource(trip.platform.id),
    });
  };

  const openDatePickerModal = () => {
    setCalendarMonth(startOfMonth(selectedDate));
    setShowDatePickerModal(true);
  };

  const closeDatePickerModal = () => {
    setShowDatePickerModal(false);
  };

  const handleSaveWorkday = async () => {
    const trimmedEndOdometer = endOdometerInput.trim();
    const endOdometer =
      trimmedEndOdometer === "" ? null : parsePositiveIntegerInput(trimmedEndOdometer);

    if (trimmedEndOdometer !== "" && endOdometer === null) {
      Alert.alert(
        "Odómetro final inválido",
        "Introduce un odómetro final entero y positivo, o déjalo vacío.",
      );
      return;
    }

    await handleCloseWorkday(endOdometer);
    setShowCloseWorkdayModal(false);
    setEndOdometerInput("");
  };

  const handleExportWorkday = async () => {
    if (!canExportWorkday || projection.workdayId === null) return;
    await ExportService.exportWorkdayTripsToCSV(projection.workdayId);
  };

  const header = (
    <View style={styles.headerContainer}>
      <View style={styles.heroBlock}>
        <Text style={styles.kicker}>Resumen de jornada</Text>
        <View style={styles.heroTopRow}>
          <Text style={styles.dateLabel}>{formatDateLabel(selectedDate)}</Text>
          <Text
            style={[
              styles.statusPill,
              hasOpenWorkday ? styles.statusOpen : styles.statusClosed,
            ]}
          >
            {projection.statusLabel}
          </Text>
        </View>
        <View style={styles.contextBarBottomRow}>
          <View style={styles.contextBarBottomLeft}>
            <Pressable
              hitSlop={10}
              onPress={() => setSelectedDate((current) => addCalendarDays(current, -1))}
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
              onPress={() => setSelectedDate((current) => addCalendarDays(current, 1))}
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
        </View>
        <Text style={styles.heroValue}>{formatMoney(projection.totalAmount)}</Text>
        <Text style={styles.heroMeta}>
          {projection.totalServices} servicios · Propinas {formatMoney(projection.tipTotalAmount)}
        </Text>
        <Text style={styles.heroNote}>{projection.statusNote}</Text>
      </View>

      <View style={styles.section}>
        <SectionTitle title="Estado y conciliación" />
        <MetricRow
          label="Horas trabajadas"
          value={projection.workedDurationLabel}
          detail={projection.workdayRangeLabel}
        />
        {projection.workedKilometers !== null ? (
          <MetricRow
            label="Kilómetros trabajados"
            value={`${projection.workedKilometers} km`}
          />
        ) : null}
        <MetricRow
          label="Servicios cerrados"
          value={String(projection.completedServices)}
        />
        {projection.incidentServices > 0 ? (
          <MetricRow
            label="Incidencias visibles"
            value={String(projection.incidentServices)}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Propinas" subtitle="Separadas de la recaudación principal" />
        <MetricRow label="Tarjeta" value={formatMoney(projection.tipCardAmount)} />
        <MetricRow label="Efectivo" value={formatMoney(projection.tipCashAmount)} />
      </View>

      <View style={styles.section}>
        <SectionTitle title="Por plataforma" subtitle="Pulsa para ver solo esos servicios" />
        {projection.platformRows.map((group) => (
          <DrilldownRow
            key={group.id}
            group={group}
            onPress={() => openDrilldown(group)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Por método de cobro" subtitle="Pulsa para el mismo drill-down filtrado" />
        {projection.paymentRows.map((group) => (
          <DrilldownRow
            key={group.id}
            group={group}
            onPress={() => openDrilldown(group)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Revisión" subtitle="Servicios pendientes o en curso" />
        {projection.incidentRows.length > 0 ? (
          projection.incidentRows.map((group) => (
            <DrilldownRow
              key={group.id}
              group={group}
              onPress={() => openDrilldown(group)}
            />
          ))
        ) : (
          <Text style={styles.sectionEmpty}>Sin incidencias relevantes.</Text>
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Servicios de la jornada" subtitle="Listado completo y cronológico" />
      </View>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <View style={styles.footerActions}>
        {hasOpenWorkday ? (
          <Pressable
            onPress={() => {
              setEndOdometerInput(
                workdayInfo?.endOdometer !== null && workdayInfo?.endOdometer !== undefined
                  ? String(workdayInfo.endOdometer)
                  : "",
              );
              setShowCloseWorkdayModal(true);
            }}
            style={styles.primaryAction}
          >
            <Text style={styles.primaryActionText}>Cerrar jornada</Text>
          </Pressable>
        ) : null}

        {canExportWorkday ? (
          <Pressable onPress={handleExportWorkday} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Exportar esta jornada</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable onPress={() => router.push("/")} style={styles.backLink}>
        <Text style={styles.backLinkText}>Volver a la Home</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FlatList
        data={projection.tripHistory}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        renderItem={({ item }) => (
          <TripHistoryRow
            trip={item}
            onRegisteredPress={(tripId) =>
              router.push({
                pathname: "/trip/edit",
                params: { tripId },
              })
            }
            onPendingPress={(trip) => openPendingService(trip)}
          />
        )}
        ListEmptyComponent={<TripHistoryEmptyState />}
      />

      <SummaryDrilldownSheet
        visible={selectedGroup !== null}
        title={selectedGroup?.title ?? ""}
        subtitle={selectedGroup?.subtitle ?? ""}
        countLabel={`${selectedGroup?.count ?? 0} servicios`}
        amountLabel={formatMoney(selectedGroup?.amount ?? 0)}
        trips={openGroups}
        onClose={closeDrilldown}
        onRegisteredTripPress={(tripId) =>
          router.push({
            pathname: "/trip/edit",
            params: { tripId },
          })
        }
        onPendingTripPress={(trip) => openPendingService(trip)}
      />

      <CompleteServiceFlowController
        ref={completeServiceFlowRef}
        refreshData={refreshData}
        setLastPayment={setLastPayment}
        setLastSource={setLastSource}
        onServiceSaved={() => {
          setSelectedGroup(null);
        }}
        onCompleteLater={refreshData}
      />

      {showCloseWorkdayModal ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cerrar jornada</Text>
            <Text>Odómetro final</Text>
            <TextInput
              value={endOdometerInput}
              onChangeText={setEndOdometerInput}
              keyboardType="number-pad"
              placeholder="123789"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setShowCloseWorkdayModal(false);
                  setEndOdometerInput("");
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable onPress={handleSaveWorkday} style={styles.modalButtonPrimary}>
                <Text style={styles.modalButtonPrimaryText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

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
                      setSelectedDate(day);
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
    backgroundColor: "#f4f1eb",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  headerContainer: {
    gap: 12,
    paddingBottom: 12,
  },
  heroBlock: {
    gap: 6,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#6e6457",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  dateLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#1f1a17",
    textTransform: "capitalize",
  },
  statusPill: {
    minHeight: 28,
    minWidth: 90,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  statusOpen: {
    backgroundColor: "#dff4ef",
    color: "#0f766e",
  },
  statusClosed: {
    backgroundColor: "#ece5da",
    color: "#2b2521",
  },
  contextBarBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contextBarBottomLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateNavigatorArrow: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2b2521",
  },
  dateNavigatorArrowDisabled: {
    color: "#9f968a",
  },
  dateNavigatorDisabled: {
    opacity: 0.45,
  },
  dateNavigatorPressed: {
    opacity: 0.7,
  },
  contextCalendarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e9e2d8",
    alignItems: "center",
    justifyContent: "center",
  },
  contextCalendarButtonPressed: {
    opacity: 0.82,
  },
  contextCalendarIcon: {
    fontSize: 16,
  },
  heroValue: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    color: "#181311",
  },
  heroMeta: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4d463f",
  },
  heroNote: {
    fontSize: 13,
    color: "#6e6457",
  },
  section: {
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(31, 26, 23, 0.12)",
  },
  sectionTitleBlock: {
    gap: 2,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1f1a17",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6e6457",
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(31, 26, 23, 0.08)",
  },
  metricRowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1f1a17",
  },
  metricDetail: {
    fontSize: 12,
    color: "#6e6457",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#231d1a",
    textAlign: "right",
  },
  drilldownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(31, 26, 23, 0.08)",
  },
  drilldownText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  drilldownTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1f1a17",
  },
  drilldownSubtitle: {
    fontSize: 12,
    color: "#6e6457",
  },
  drilldownMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  drilldownCount: {
    minWidth: 24,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    color: "#231d1a",
  },
  drilldownAmount: {
    minWidth: 84,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    color: "#231d1a",
  },
  drilldownChevron: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6e6457",
  },
  sectionEmpty: {
    fontSize: 13,
    color: "#6e6457",
    paddingVertical: 6,
  },
  itemSeparator: {
    height: 8,
  },
  footer: {
    gap: 10,
    paddingTop: 18,
    paddingBottom: 8,
  },
  footerActions: {
    gap: 10,
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
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryAction: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#ece5da",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2b2521",
  },
  backLink: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6e6457",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  calendarHeaderArrow: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2b2521",
  },
  calendarWeekdays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  calendarWeekday: {
    width: 36,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: "#6e6457",
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
    backgroundColor: "#f0e8dc",
  },
  calendarCellSelected: {
    backgroundColor: "#d8ccb8",
  },
  calendarCellText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b2521",
  },
  calendarCellTextSelected: {
    color: "#1f1a17",
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
  pressed: {
    opacity: 0.82,
  },
});

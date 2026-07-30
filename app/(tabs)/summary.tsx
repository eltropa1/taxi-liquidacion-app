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
import { MaterialIcons } from "@expo/vector-icons";

import { ExportService } from "../../src/application/runtime";
import { EconomicDrilldownRow } from "../../src/components/economic/EconomicDrilldownRow";
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
import type { ThemeColors, RadiiTokens } from "../../src/presentation/theme/tokens";
import { useAppTheme } from "../../src/presentation/theme/ThemeProvider";

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

type SummaryStyles = ReturnType<typeof createStyles>;

function SectionTitle({
  title,
  subtitle,
  styles,
}: {
  title: string;
  subtitle?: string;
  styles: SummaryStyles;
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
  styles,
}: {
  label: string;
  value: string;
  detail?: string;
  styles: SummaryStyles;
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

export default function SummaryScreen() {
  const { colors: themeColors, radii: themeRadii } = useAppTheme();
  const styles = useMemo(() => createStyles(themeColors, themeRadii), [themeColors, themeRadii]);
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
              <MaterialIcons name="calendar-today" size={16} color={themeColors.primary} />
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

            {!isLatestAvailableDate ? (
              <Pressable
                hitSlop={6}
                onPress={() => setSelectedDate(new Date())}
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
        </View>
        <Text style={styles.heroValue}>{formatMoney(projection.totalAmount)}</Text>
        <Text style={styles.heroMeta}>
          {projection.totalServices} servicios · Propinas {formatMoney(projection.tipTotalAmount)}
        </Text>
        <Text style={styles.heroNote}>{projection.statusNote}</Text>
      </View>

      <View style={styles.section}>
        <SectionTitle title="Estado y conciliación" styles={styles} />
        <MetricRow
          label="Horas trabajadas"
          value={projection.workedDurationLabel}
          detail={projection.workdayRangeLabel}
          styles={styles}
        />
        {projection.workedKilometers !== null ? (
          <MetricRow
            label="Kilómetros trabajados"
            value={`${projection.workedKilometers} km`}
            styles={styles}
          />
        ) : null}
        <MetricRow
          label="Servicios cerrados"
          value={String(projection.completedServices)}
          styles={styles}
        />
        {projection.incidentServices > 0 ? (
          <MetricRow
            label="Incidencias visibles"
            value={String(projection.incidentServices)}
            styles={styles}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Propinas" subtitle="Separadas de la recaudación principal" styles={styles} />
        <MetricRow label="Tarjeta" value={formatMoney(projection.tipCardAmount)} styles={styles} />
        <MetricRow label="Efectivo" value={formatMoney(projection.tipCashAmount)} styles={styles} />
      </View>

      <View style={styles.section}>
        <SectionTitle title="Por plataforma" subtitle="Pulsa para ver solo esos servicios" styles={styles} />
        {projection.platformRows.map((group) => (
          <EconomicDrilldownRow
            key={group.id}
            group={group}
            onPress={() => openDrilldown(group)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Por método de cobro" subtitle="Pulsa para el mismo drill-down filtrado" styles={styles} />
        {projection.paymentRows.map((group) => (
          <EconomicDrilldownRow
            key={group.id}
            group={group}
            onPress={() => openDrilldown(group)}
          />
        ))}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Revisión" subtitle="Servicios pendientes o en curso" styles={styles} />
        {projection.incidentRows.length > 0 ? (
          projection.incidentRows.map((group) => (
            <EconomicDrilldownRow
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
        <SectionTitle title="Servicios de la jornada" subtitle="Listado completo y cronológico" styles={styles} />
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

function createStyles(themeColors: ThemeColors, themeRadii: RadiiTokens) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: themeColors.bg,
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
    color: themeColors.textSecondary,
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
    color: themeColors.textPrimary,
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
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  statusOpen: {
    backgroundColor: themeColors.primarySubtle,
    color: themeColors.primary,
  },
  statusClosed: {
    backgroundColor: themeColors.border,
    color: themeColors.textSecondary,
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
    color: themeColors.textPrimary,
  },
  dateNavigatorArrowDisabled: {
    color: themeColors.textSecondary,
  },
  dateNavigatorDisabled: {
    opacity: 0.45,
  },
  dateNavigatorPressed: {
    opacity: 0.7,
  },
  contextCalendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  contextCalendarButtonPressed: {
    opacity: 0.82,
  },
  todayButton: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: themeColors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  todayButtonPressed: {
    opacity: 0.75,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: themeColors.primary,
  },
  heroValue: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "600",
    color: themeColors.textPrimary,
  },
  heroMeta: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  heroNote: {
    fontSize: 13,
    color: themeColors.textSecondary,
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
    fontWeight: "600",
    color: themeColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: themeColors.textSecondary,
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
    color: themeColors.textPrimary,
  },
  metricDetail: {
    fontSize: 12,
    color: themeColors.textSecondary,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textPrimary,
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
    color: themeColors.textPrimary,
  },
  drilldownSubtitle: {
    fontSize: 12,
    color: themeColors.textSecondary,
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
    color: themeColors.textPrimary,
  },
  drilldownAmount: {
    minWidth: 84,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  drilldownChevron: {
    fontSize: 18,
    fontWeight: "800",
    color: themeColors.textSecondary,
  },
  sectionEmpty: {
    fontSize: 13,
    color: themeColors.textSecondary,
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
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryActionText: {
    color: themeColors.surface,
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryAction: {
    minHeight: 44,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.bg,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: themeColors.surface,
    borderRadius: themeRadii.card,
    padding: 18,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: themeColors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: themeRadii.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: themeColors.textPrimary,
    backgroundColor: themeColors.surface,
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
    color: themeColors.textPrimary,
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
    backgroundColor: themeColors.border,
  },
  calendarCellText: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  calendarCellTextSelected: {
    color: themeColors.textPrimary,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.bg,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  modalButtonPrimary: {
    flex: 1,
    minHeight: 44,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPrimaryText: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.surface,
  },
  pressed: {
    opacity: 0.82,
  },
  });
}

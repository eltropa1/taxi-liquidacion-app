import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { HistoricalPeriodSelection, HistoricalPeriodType } from "../../src/application/history";
import { ExportService } from "../../src/application/runtime";
import { CreateManualTrip } from "../../src/application/trips/CreateManualTrip";
import { ClosedWorkdayEditConfirmationRequiredError } from "../../src/application/trips/ClosedWorkdayEditConfirmationRequiredError";
import { PaymentType, TripSource } from "../../src/constants/enums";
import { EconomicDrilldownRow } from "../../src/components/economic/EconomicDrilldownRow";
import { HistoryCustomRangeModal } from "../../src/components/history/HistoryCustomRangeModal";
import { HistoryScalePickerModal } from "../../src/components/history/HistoryScalePickerModal";
import { SummaryDrilldownSheet } from "../../src/components/summary/SummaryDrilldownSheet";
import { buildHistoryScreenProjection } from "../../src/presentation/history";
import type { EconomicDrilldownGroup } from "../../src/presentation/economics";
import { useHistoryScreen } from "../../src/hooks/useHistoryScreen";
import type { ThemeColors, RadiiTokens } from "../../src/presentation/theme/tokens";
import { useAppTheme } from "../../src/presentation/theme/ThemeProvider";
import { parseMoneyInput } from "../../src/utils/numberInput";

type HistoryScale = Extract<HistoricalPeriodType, "week" | "fortnight" | "month" | "year" | "custom">;

function parseSelectedDate(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return new Date();

  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function createLocalNoonDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} €`;
}

function formatScaleLabel(value: HistoryScale) {
  switch (value) {
    case "week":
      return "Semana";
    case "fortnight":
      return "Quincena";
    case "month":
      return "Mes";
    case "year":
      return "Año";
    case "custom":
      return "Personalizado";
  }
}

function getBreakdownSectionCopy(periodType: HistoryScale | undefined) {
  switch (periodType) {
    case "month":
      return {
        title: "Semanas del mes",
        subtitle: "Pulsa una semana para abrir su histórico operativo",
      };
    case "year":
      return {
        title: "Meses del año",
        subtitle: "Pulsa un mes para abrir su histórico operativo",
      };
    default:
      return {
        title: "Desglose del periodo",
        subtitle: "Pulsa una fila para abrir su histórico operativo",
      };
  }
}

function parsePeriodType(value: string | string[] | undefined): HistoryScale {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (
    candidate === "month" ||
    candidate === "custom" ||
    candidate === "fortnight" ||
    candidate === "year"
  ) {
    return candidate;
  }

  return "week";
}

function parseHistorySelection(params: {
  date?: string;
  period?: string;
  start?: string;
  end?: string;
}): HistoricalPeriodSelection {
  const periodType = parsePeriodType(params.period);

  if (periodType === "custom") {
    const startCandidate = parseSelectedDate(params.start ?? params.date);
    const endCandidate = parseSelectedDate(params.end ?? params.start ?? params.date);
    const [startDate, endDate] =
      startCandidate.getTime() <= endCandidate.getTime()
        ? [createLocalNoonDate(startCandidate), createLocalNoonDate(endCandidate)]
        : [createLocalNoonDate(endCandidate), createLocalNoonDate(startCandidate)];

    return {
      periodType: "custom",
      startDate,
      endDate,
    };
  }

  return {
    periodType,
    anchorDate: createLocalNoonDate(parseSelectedDate(params.date)),
  };
}

type HistoryStyles = ReturnType<typeof createStyles>;

function SectionTitle({
  title,
  subtitle,
  styles,
}: {
  title: string;
  subtitle?: string;
  styles: HistoryStyles;
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
  styles: HistoryStyles;
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

function BreakdownRow({
  rangeLabel,
  workdaysLabel,
  servicesLabel,
  amountLabel,
  goalContextLabel,
  goalContextDetail,
  onPress,
  styles,
}: {
  rangeLabel: string;
  workdaysLabel: string;
  servicesLabel: string;
  amountLabel: string;
  goalContextLabel: string;
  goalContextDetail: string;
  onPress: () => void;
  styles: HistoryStyles;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir desglose ${rangeLabel}`}
      style={({ pressed }) => [styles.breakdownRow, pressed && styles.pressed]}
    >
      <View style={styles.breakdownText}>
        <Text style={styles.breakdownTitle}>{rangeLabel}</Text>
        <Text style={styles.breakdownSubtitle}>
          {workdaysLabel} · {servicesLabel}
        </Text>
        <Text style={styles.breakdownGoal}>{goalContextLabel}</Text>
        <Text style={styles.breakdownGoalDetail}>{goalContextDetail}</Text>
      </View>

      <View style={styles.breakdownMeta}>
        <Text style={styles.breakdownAmount}>{amountLabel}</Text>
        <Text style={styles.breakdownChevron}>›</Text>
      </View>
    </Pressable>
  );
}

function WorkdayRow({
  dateLabel,
  timeRangeLabel,
  statusLabel,
  servicesLabel,
  amountLabel,
  goalContextLabel,
  goalContextDetail,
  onPress,
  onAddService,
  styles,
}: {
  dateLabel: string;
  timeRangeLabel: string;
  statusLabel: "ABIERTA" | "CERRADA";
  servicesLabel: string;
  amountLabel: string;
  goalContextLabel: string;
  goalContextDetail: string;
  onPress: () => void;
  onAddService: () => void;
  styles: HistoryStyles;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir jornada ${dateLabel}`}
      style={({ pressed }) => [styles.workdayRow, pressed && styles.pressed]}
    >
      <View style={styles.workdayText}>
        <View style={styles.workdayTitleRow}>
          <Text style={styles.workdayTitle}>{dateLabel}</Text>
          <Text
            style={[
              styles.workdayStatus,
              statusLabel === "ABIERTA" ? styles.statusOpen : styles.statusClosed,
            ]}
          >
            {statusLabel}
          </Text>
        </View>
        <Text style={styles.workdaySubtitle}>{timeRangeLabel}</Text>
        <Text style={styles.workdayGoal}>{goalContextLabel}</Text>
        <Text style={styles.workdayGoalDetail}>{goalContextDetail}</Text>
      </View>

      <View style={styles.workdayMeta}>
        <Text style={styles.workdayServices}>{servicesLabel}</Text>
        <Text style={styles.workdayAmount}>{amountLabel}</Text>
        {statusLabel === "CERRADA" ? (
          <Pressable
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onAddService();
            }}
            accessibilityRole="button"
            accessibilityLabel={`Añadir servicio olvidado a la jornada ${dateLabel}`}
            style={({ pressed }) => [
              styles.addServiceButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addServiceButtonText}>+ Servicio</Text>
          </Pressable>
        ) : null}
        <Text style={styles.workdayChevron}>›</Text>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const { colors: themeColors, radii: themeRadii } = useAppTheme();
  const styles = useMemo(() => createStyles(themeColors, themeRadii), [themeColors, themeRadii]);
  const params = useLocalSearchParams<{
    date?: string;
    period?: string;
    start?: string;
    end?: string;
  }>();
  const { date, period, start, end } = params;
  const [selection, setSelection] = useState<HistoricalPeriodSelection>(() =>
    parseHistorySelection(params),
  );
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false);
  const [showScalePickerModal, setShowScalePickerModal] = useState(false);
  const [customInitialStartDate, setCustomInitialStartDate] = useState(new Date());
  const [customInitialEndDate, setCustomInitialEndDate] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEconomicGroup, setSelectedEconomicGroup] =
    useState<EconomicDrilldownGroup | null>(null);
  const [addServiceTarget, setAddServiceTarget] = useState<{
    id: number;
    dateLabel: string;
    startTime: string;
  } | null>(null);
  const [addServiceStartInput, setAddServiceStartInput] = useState("09:00");
  const [addServiceEndInput, setAddServiceEndInput] = useState("09:15");
  const [addServiceAmountInput, setAddServiceAmountInput] = useState("");
  const [addServicePayment, setAddServicePayment] = useState<PaymentType>(PaymentType.CASH);
  const [addServiceSource, setAddServiceSource] = useState<TripSource>(TripSource.TAXI);

  const { historyData, error, refreshData } = useHistoryScreen(selection);

  useEffect(() => {
    setSelection(parseHistorySelection({ date, period, start, end }));
  }, [date, end, period, start]);

  const projection = useMemo(
    () => (historyData ? buildHistoryScreenProjection(historyData) : null),
    [historyData],
  );

  const navigateToSelection = (
    nextSelection: HistoricalPeriodSelection,
    mode: "replace" | "push" = "replace",
  ) => {
    setSelection(nextSelection);

    const nextParams =
      nextSelection.periodType === "custom"
        ? {
            period: "custom",
            start: nextSelection.startDate.toISOString(),
            end: nextSelection.endDate.toISOString(),
          }
        : {
            period: nextSelection.periodType,
            date: nextSelection.anchorDate.toISOString(),
          };

    const navigation = mode === "replace" ? router.replace : router.push;
    navigation({
      pathname: "/history",
      params: nextParams,
    });
  };

  const openCustomRangeModal = () => {
    const fallbackStart =
      historyData?.period.startDate ??
      (selection.periodType === "custom" ? selection.startDate : selection.anchorDate);
    const fallbackEnd =
      historyData?.period.endDate ??
      (selection.periodType === "custom" ? selection.endDate : selection.anchorDate);

    setCustomInitialStartDate(fallbackStart);
    setCustomInitialEndDate(fallbackEnd);
    setShowCustomRangeModal(true);
  };

  const applyCustomRange = (startDate: Date, endDate: Date) => {
    navigateToSelection(
      {
        periodType: "custom",
        startDate,
        endDate,
      },
      "replace",
    );
    setShowCustomRangeModal(false);
  };

  const goToPrevious = () => {
    const previous = projection?.previousSelection;
    if (!previous) {
      return;
    }

    navigateToSelection(previous, "replace");
  };

  const goToNext = () => {
    const next = projection?.nextSelection;
    if (!next) {
      return;
    }

    navigateToSelection(next, "replace");
  };

  const goToCurrentPeriod = () => {
    if (selectedScale === "custom") {
      return;
    }

    navigateToSelection(
      {
        periodType: selectedScale,
        anchorDate: createLocalNoonDate(new Date()),
      },
      "replace",
    );
  };

  const openHistoricalSelection = (nextSelection: HistoricalPeriodSelection) => {
    navigateToSelection(nextSelection, "push");
  };

  const openEconomicGroup = (group: EconomicDrilldownGroup) => {
    setSelectedEconomicGroup(group);
  };

  const closeEconomicGroup = () => {
    setSelectedEconomicGroup(null);
  };

  const openWorkdaySummary = (startTime: string) => {
    router.push({
      pathname: "/summary",
      params: { date: startTime },
    });
  };

  const openAddServiceModal = (target: { id: number; dateLabel: string; startTime: string }) => {
    setAddServiceTarget(target);
    setAddServiceStartInput("09:00");
    setAddServiceEndInput("09:15");
    setAddServiceAmountInput("");
    setAddServicePayment(PaymentType.CASH);
    setAddServiceSource(TripSource.TAXI);
  };

  const closeAddServiceModal = () => {
    setAddServiceTarget(null);
  };

  function parseTimeOfDay(value: string) {
    const match = /^([0-1]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
    if (!match) return null;
    return { hours: Number(match[1]), minutes: Number(match[2]) };
  }

  const handleSaveAddedService = () => {
    if (!addServiceTarget) return;

    const amount = parseMoneyInput(addServiceAmountInput);
    if (amount === null || amount <= 0) {
      Alert.alert("Importe inválido", "Introduce un importe mayor que cero.");
      return;
    }

    const start = parseTimeOfDay(addServiceStartInput);
    const end = parseTimeOfDay(addServiceEndInput);
    if (!start || !end) {
      Alert.alert("Hora inválida", "Usa el formato HH:mm, por ejemplo 09:30.");
      return;
    }

    const baseDate = new Date(addServiceTarget.startTime);
    const startTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      start.hours,
      start.minutes,
    );
    let endTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      end.hours,
      end.minutes,
    );

    // Un servicio de taxi no dura más de 24h: si la hora de fin cae "antes"
    // que la de inicio en el mismo día, es que el servicio cruza la medianoche.
    if (endTime < startTime) {
      endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
    }

    if (endTime <= startTime) {
      Alert.alert("Horario inválido", "La hora de fin debe ser posterior a la de inicio.");
      return;
    }

    // Camino de respuesta instantánea: cerramos el modal al toque y el guardado
    // en SQLite continúa en segundo plano.
    setAddServiceTarget(null);
    saveManualTripWithClosedWorkdayConfirmation({
      startTime,
      endTime,
      amount,
      payment: addServicePayment,
      source: addServiceSource,
    });
  };

  function saveManualTripWithClosedWorkdayConfirmation(command: {
    startTime: Date;
    endTime: Date;
    amount: number;
    payment: PaymentType;
    source: TripSource;
  }) {
    CreateManualTrip.execute(command)
      .then(() => refreshData())
      .catch((error) => {
        if (error instanceof ClosedWorkdayEditConfirmationRequiredError) {
          Alert.alert(
            "Jornada ya cerrada",
            `La jornada del ${new Date(
              error.workdayStartTime,
            ).toLocaleDateString()} ya está cerrada. Añadir este servicio alterará las cifras y estadísticas ya calculadas de esa jornada. ¿Confirmas el alta?`,
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Confirmar alta",
                style: "destructive",
                onPress: () => {
                  CreateManualTrip.execute(command, {
                    confirmedClosedWorkdayEdit: true,
                  })
                    .then(() => refreshData())
                    .catch((retryError) => {
                      console.error("Error añadiendo servicio a jornada cerrada", retryError);
                      Alert.alert(
                        "No se ha podido guardar",
                        "Revisa los datos e inténtalo de nuevo.",
                      );
                    });
                },
              },
            ],
          );
          return;
        }

        console.error("Error añadiendo servicio", error);
        Alert.alert(
          "No se ha podido guardar",
          "Revisa los datos e inténtalo de nuevo.",
        );
      });
  }

  const handleExportHistoricalDataset = async () => {
    if (!historyData) {
      Alert.alert(
        "Historial no disponible",
        "Espera a que se cargue el periodo antes de exportarlo.",
      );
      return;
    }

    if (historyData.records.length === 0) {
      Alert.alert(
        "Periodo vacío",
        "No hay servicios en este periodo para exportar.",
      );
      return;
    }

    try {
      setIsExporting(true);
      await ExportService.exportHistoricalDatasetToCSV(historyData);
    } catch (error) {
      Alert.alert(
        "No se pudo exportar",
        error instanceof Error ? error.message : "Ha ocurrido un error inesperado.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshHistory = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  const openScale = (nextScale: HistoryScale) => {
    if (nextScale === "custom") {
      setShowScalePickerModal(false);
      openCustomRangeModal();
      return;
    }

    const referenceDate =
      selection.periodType === "custom" ? selection.startDate : selection.anchorDate;

    navigateToSelection(
      {
        periodType: nextScale,
        anchorDate: createLocalNoonDate(referenceDate),
      },
      "replace",
    );
    setShowScalePickerModal(false);
  };

  const selectedScale = projection?.periodType ?? selection.periodType;

  const header = (
    <View style={styles.headerContainer}>
      <View style={styles.heroBlock}>
        <Text style={styles.kicker}>Historial</Text>
        <View style={styles.heroTopRow}>
          <Text style={styles.periodLabel}>
            {projection?.periodStatusLabel ?? "Semana actual"}
          </Text>
          <Text style={styles.periodPill}>
            {projection?.periodLabel ?? "Cargando…"}
          </Text>
        </View>
        <Text style={styles.rangeLabel}>{projection?.periodRangeLabel ?? ""}</Text>
        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <Pressable
          onPress={() => setShowScalePickerModal(true)}
          accessibilityRole="button"
          accessibilityLabel={`Cambiar escala. Actual: ${formatScaleLabel(selectedScale)}`}
          style={({ pressed }) => [styles.scalePickerButton, pressed && styles.pressed]}
        >
          <Text style={styles.scalePickerLabel}>Escala</Text>
          <Text style={styles.scalePickerValue}>{formatScaleLabel(selectedScale)}</Text>
          <Text style={styles.scalePickerChevron}>›</Text>
        </Pressable>

        {selectedScale === "custom" ? (
          <Pressable
            onPress={openCustomRangeModal}
            style={({ pressed }) => [styles.customRangeBanner, pressed && styles.pressed]}
          >
            <Text style={styles.customRangeLabel}>Rango activo</Text>
            <Text style={styles.customRangeValue}>
              {projection?.periodRangeLabel ?? "Selecciona un rango"}
            </Text>
            <Text style={styles.customRangeAction}>Editar rango</Text>
          </Pressable>
        ) : null}

        <View style={styles.navigationRow}>
          <Pressable
            disabled={!projection?.canNavigatePrevious}
            onPress={goToPrevious}
            accessibilityRole="button"
            accessibilityLabel="Periodo anterior"
            style={({ pressed }) => [
              styles.navigationButton,
              pressed && styles.navigationButtonPressed,
              !projection?.canNavigatePrevious && styles.navigationButtonDisabled,
            ]}
          >
            <Text style={styles.navigationArrow}>‹</Text>
            </Pressable>

          {selectedScale !== "custom" && !historyData?.period.isCurrent ? (
            <Pressable
              onPress={goToCurrentPeriod}
              accessibilityRole="button"
              accessibilityLabel="Volver al periodo actual"
              style={({ pressed }) => [
                styles.navigationCurrentButton,
                pressed && styles.navigationButtonPressed,
              ]}
            >
              <Text style={styles.navigationCurrentButtonText}>Actual</Text>
            </Pressable>
          ) : null}

          <Pressable
            disabled={!projection?.canNavigateNext}
            onPress={goToNext}
            accessibilityRole="button"
            accessibilityLabel="Periodo siguiente"
            style={({ pressed }) => [
              styles.navigationButton,
              pressed && styles.navigationButtonPressed,
              !projection?.canNavigateNext && styles.navigationButtonDisabled,
            ]}
          >
            <Text style={styles.navigationArrow}>›</Text>
          </Pressable>
        </View>

        <Pressable
          disabled={isExporting || !historyData}
          onPress={handleExportHistoricalDataset}
          accessibilityRole="button"
          accessibilityLabel="Exportar este periodo"
          style={({ pressed }) => [
            styles.exportButton,
            pressed && !isExporting && historyData && styles.exportButtonPressed,
            (isExporting || !historyData) && styles.exportButtonDisabled,
          ]}
        >
          <Text style={styles.exportButtonText}>
            {isExporting ? "Exportando…" : "Exportar este periodo"}
          </Text>
        </Pressable>

        <View style={styles.heroTotals}>
          <Text style={styles.heroValue}>
            {formatMoney(historyData?.summary.total ?? null)}
          </Text>
          <Text style={styles.heroMeta}>
            {(historyData?.summary.servicesTotal ?? 0).toString()} servicios ·{" "}
            {(historyData?.breakdown.length ?? 0).toString()} jornadas · Propinas{" "}
            {formatMoney(
              historyData
                ? historyData.summary.propinaTarjeta + historyData.summary.propinaEfectivo
                : null,
            )}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Consolidado económico"
          subtitle="Mismo lenguaje que Resumen de Jornada"
          styles={styles}
        />
        {projection?.summaryRows
          ?.filter((row) => row.id !== "income")
          .map((row) => (
            <MetricRow
              key={row.id}
              label={row.label}
              value={row.value}
              detail={row.detail}
              styles={styles}
            />
        )) ?? null}
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Por plataforma"
          subtitle="Pulsa para ver solo esos servicios"
          styles={styles}
        />
        {projection?.platformRows?.length ? (
          projection.platformRows.map((group) => (
            <EconomicDrilldownRow
              key={group.id}
              group={group}
              onPress={() => openEconomicGroup(group)}
            />
          ))
        ) : (
          <Text style={styles.sectionEmpty}>Sin servicios para agrupar por plataforma.</Text>
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Por método de cobro"
          subtitle="Pulsa para el mismo drill-down filtrado"
          styles={styles}
        />
        {projection?.paymentRows?.length ? (
          projection.paymentRows.map((group) => (
            <EconomicDrilldownRow
              key={group.id}
              group={group}
              onPress={() => openEconomicGroup(group)}
            />
          ))
        ) : (
          <Text style={styles.sectionEmpty}>Sin servicios para agrupar por pago.</Text>
        )}
      </View>

      {projection?.periodBreakdownRows?.length ? (
        <View style={styles.section}>
          <SectionTitle
            title={getBreakdownSectionCopy(projection.periodType).title}
            subtitle={getBreakdownSectionCopy(projection.periodType).subtitle}
            styles={styles}
          />
          {projection.periodBreakdownRows.map((row) => (
            <BreakdownRow
              key={row.id}
              rangeLabel={row.rangeLabel}
              workdaysLabel={row.workdaysLabel}
              servicesLabel={row.servicesLabel}
              amountLabel={row.amountLabel}
              goalContextLabel={row.goalContextLabel}
              goalContextDetail={row.goalContextDetail}
              onPress={() => openHistoricalSelection(row.selection)}
              styles={styles}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionTitle
          title="Contexto de metas"
          subtitle={projection?.goalContextDetail ?? "Cargando contexto…"}
          styles={styles}
        />
        {projection?.goalRows ? (
          projection.goalRows.map((row) => (
            <MetricRow key={row.label} label={row.label} value={row.value} styles={styles} />
          ))
        ) : (
          <Text style={styles.sectionEmpty}>{projection?.goalContextLabel ?? ""}</Text>
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Jornadas"
          subtitle="Pulsa en una jornada para abrir su resumen"
          styles={styles}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <FlatList
        data={projection?.workdayRows ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        refreshing={isRefreshing}
        onRefresh={handleRefreshHistory}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        renderItem={({ item }) => (
          <WorkdayRow
            dateLabel={item.dateLabel}
            timeRangeLabel={item.timeRangeLabel}
            statusLabel={item.statusLabel}
            servicesLabel={item.servicesLabel}
            amountLabel={item.amountLabel}
            goalContextLabel={item.goalContextLabel}
            goalContextDetail={item.goalContextDetail}
            onPress={() => openWorkdaySummary(item.startTime)}
            onAddService={() =>
              openAddServiceModal({
                id: item.id,
                dateLabel: item.dateLabel,
                startTime: item.startTime,
              })
            }
            styles={styles}
          />
        )}
        ListEmptyComponent={
          projection ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Sin jornadas en este periodo</Text>
              <Text style={styles.emptyStateText}>{projection.emptyStateLabel}</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Cargando historial…</Text>
            </View>
          )
        }
      />

      <HistoryCustomRangeModal
        visible={showCustomRangeModal}
        initialStartDate={customInitialStartDate}
        initialEndDate={customInitialEndDate}
        onCancel={() => setShowCustomRangeModal(false)}
        onApply={applyCustomRange}
      />

      <HistoryScalePickerModal
        visible={showScalePickerModal}
        currentScale={selectedScale}
        onCancel={() => setShowScalePickerModal(false)}
        onSelectScale={(scale) => {
          setShowScalePickerModal(false);
          openScale(scale);
        }}
      />

      <SummaryDrilldownSheet
        visible={selectedEconomicGroup !== null}
        title={selectedEconomicGroup?.title ?? ""}
        subtitle={selectedEconomicGroup?.subtitle ?? ""}
        countLabel={`${selectedEconomicGroup?.count ?? 0} servicios`}
        amountLabel={formatMoney(selectedEconomicGroup?.amount ?? null)}
        trips={selectedEconomicGroup?.trips ?? []}
        onClose={closeEconomicGroup}
        onRegisteredTripPress={(tripId) =>
          router.push({
            pathname: "/trip/edit",
            params: { tripId },
          })
        }
        onPendingTripPress={(trip) =>
          router.push({
            pathname: "/summary",
            params: { date: trip.schedule.startTime },
          })
        }
      />

      <Modal
        visible={addServiceTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={closeAddServiceModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.addServiceOverlay}
        >
          <View style={styles.addServiceSheet}>
            <Text style={styles.addServiceTitle}>
              Servicio olvidado · {addServiceTarget?.dateLabel}
            </Text>
            <Text style={styles.addServiceSubtitle}>
              Se añade a esta jornada cerrada y los totales se recalculan al momento.
            </Text>

            <View style={styles.addServiceRow}>
              <View style={styles.addServiceField}>
                <Text style={styles.addServiceLabel}>Hora inicio</Text>
                <TextInput
                  value={addServiceStartInput}
                  onChangeText={setAddServiceStartInput}
                  placeholder="09:00"
                  style={styles.addServiceInput}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.addServiceField}>
                <Text style={styles.addServiceLabel}>Hora fin</Text>
                <TextInput
                  value={addServiceEndInput}
                  onChangeText={setAddServiceEndInput}
                  placeholder="09:15"
                  style={styles.addServiceInput}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            <Text style={styles.addServiceLabel}>Importe</Text>
            <TextInput
              value={addServiceAmountInput}
              onChangeText={setAddServiceAmountInput}
              placeholder="0,00"
              style={styles.addServiceInput}
              keyboardType="decimal-pad"
            />

            <Text style={styles.addServiceLabel}>Plataforma</Text>
            <View style={styles.addServiceOptionsRow}>
              {[
                { value: TripSource.TAXI, label: "Taxi" },
                { value: TripSource.UBER, label: "Uber" },
                { value: TripSource.CABIFY, label: "Cabify" },
                { value: TripSource.FREE_NOW, label: "FreeNow" },
              ].map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setAddServiceSource(option.value)}
                  style={[
                    styles.addServiceOption,
                    addServiceSource === option.value && styles.addServiceOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.addServiceOptionText,
                      addServiceSource === option.value && styles.addServiceOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.addServiceLabel}>Pago</Text>
            <View style={styles.addServiceOptionsRow}>
              {[
                { value: PaymentType.CASH, label: "Efectivo" },
                { value: PaymentType.CARD, label: "Tarjeta" },
                { value: PaymentType.APP, label: "App" },
              ].map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setAddServicePayment(option.value)}
                  style={[
                    styles.addServiceOption,
                    addServicePayment === option.value && styles.addServiceOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.addServiceOptionText,
                      addServicePayment === option.value && styles.addServiceOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.addServiceActions}>
              <Pressable
                onPress={closeAddServiceModal}
                style={({ pressed }) => [styles.addServiceCancelButton, pressed && styles.pressed]}
              >
                <Text style={styles.addServiceCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveAddedService}
                style={({ pressed }) => [styles.addServiceSaveButton, pressed && styles.pressed]}
              >
                <Text style={styles.addServiceSaveText}>Añadir servicio</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  heroTotals: {
    gap: 2,
    paddingTop: 2,
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
  periodLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  periodPill: {
    minHeight: 28,
    minWidth: 140,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    backgroundColor: themeColors.border,
    color: themeColors.textPrimary,
  },
  rangeLabel: {
    fontSize: 14,
    color: themeColors.textSecondary,
    fontWeight: "600",
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
  scalePickerButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: themeRadii.card,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },
  scalePickerLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: themeColors.textSecondary,
  },
  scalePickerValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  scalePickerChevron: {
    fontSize: 18,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  navigationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  navigationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationCurrentButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButtonPressed: {
    opacity: 0.82,
  },
  navigationButtonDisabled: {
    opacity: 0.4,
  },
  navigationCurrentButtonText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: themeColors.textPrimary,
  },
  navigationArrow: {
    fontSize: 22,
    fontWeight: "800",
    color: themeColors.textPrimary,
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
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: themeColors.surface,
    borderRadius: themeRadii.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: 10,
  },
  breakdownText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  breakdownSubtitle: {
    fontSize: 12,
    color: themeColors.textSecondary,
  },
  breakdownGoal: {
    fontSize: 12,
    fontWeight: "700",
    color: themeColors.textPrimary,
    marginTop: 2,
  },
  breakdownGoalDetail: {
    fontSize: 11,
    color: themeColors.textSecondary,
  },
  breakdownMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  breakdownChevron: {
    fontSize: 18,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  sectionEmpty: {
    fontSize: 13,
    color: themeColors.textSecondary,
    paddingVertical: 6,
  },
  exportButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  exportButtonPressed: {
    opacity: 0.82,
  },
  exportButtonDisabled: {
    opacity: 0.45,
  },
  exportButtonText: {
    color: themeColors.surface,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  customRangeBanner: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: themeRadii.card,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    gap: 3,
  },
  customRangeLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: themeColors.textSecondary,
  },
  customRangeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  customRangeAction: {
    fontSize: 12,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  workdayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: themeColors.surface,
    borderRadius: themeRadii.card,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  workdayText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  workdayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  workdayTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  workdayStatus: {
    minHeight: 24,
    minWidth: 72,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
  },
  statusOpen: {
    backgroundColor: themeColors.primarySubtle,
    color: themeColors.primary,
  },
  statusClosed: {
    backgroundColor: themeColors.border,
    color: themeColors.textSecondary,
  },
  workdaySubtitle: {
    fontSize: 12,
    color: themeColors.textSecondary,
  },
  workdayGoal: {
    fontSize: 12,
    fontWeight: "700",
    color: themeColors.textPrimary,
    marginTop: 2,
  },
  workdayGoalDetail: {
    fontSize: 11,
    color: themeColors.textSecondary,
  },
  workdayMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  workdayServices: {
    fontSize: 12,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  workdayAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  workdayChevron: {
    fontSize: 18,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  addServiceButton: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor: themeColors.primarySubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  addServiceButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: themeColors.primary,
  },
  itemSeparator: {
    height: 10,
  },
  emptyState: {
    paddingVertical: 32,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  emptyStateText: {
    fontSize: 13,
    color: themeColors.textSecondary,
    textAlign: "center",
  },
  errorBanner: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.dangerSubtle,
    color: themeColors.danger,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.82,
  },
  addServiceOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  addServiceSheet: {
    backgroundColor: themeColors.surface,
    borderTopLeftRadius: themeRadii.card,
    borderTopRightRadius: themeRadii.card,
    padding: 20,
    gap: 10,
  },
  addServiceTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  addServiceSubtitle: {
    fontSize: 12,
    color: themeColors.textSecondary,
    marginBottom: 6,
  },
  addServiceRow: {
    flexDirection: "row",
    gap: 12,
  },
  addServiceField: {
    flex: 1,
  },
  addServiceLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: themeColors.textSecondary,
    marginTop: 6,
  },
  addServiceInput: {
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: themeRadii.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: themeColors.textPrimary,
  },
  addServiceOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addServiceOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: themeRadii.button,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
  },
  addServiceOptionSelected: {
    backgroundColor: themeColors.primarySubtle,
    borderColor: themeColors.primary,
  },
  addServiceOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: themeColors.textSecondary,
  },
  addServiceOptionTextSelected: {
    color: themeColors.primary,
  },
  addServiceActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  addServiceCancelButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: themeRadii.button,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  addServiceCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  addServiceSaveButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.primary,
  },
  addServiceSaveText: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.surface,
  },
  });
}

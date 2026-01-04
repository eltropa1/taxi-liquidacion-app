import { useEffect, useMemo, useState } from "react";
import {
  Button,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaymentType, TripSource } from "../src/constants/enums";
import { ExportService } from "../src/services/ExportService";
import { GoalService } from "../src/services/GoalService";
import { TripService } from "../src/services/TripService";
import { SummaryService } from "../src/services/SummaryService";

/**
 * Tipo de fila para mostrar viajes
 */
type TripRow = {
  id: number;
  startTime: string;
  endTime: string | null;
  amount: number | null;
  source: TripSource;
  payment: PaymentType | null;
};

/**
 * Calcula porcentaje de progreso respecto a una meta
 */
const getProgress = (current: number, goal: number) => {
  if (goal <= 0) return null;
  return Math.min((current / goal) * 100, 100);
};

/**
 * Devuelve estado visual según porcentaje
 */
const getStatus = (percent: number | null) => {
  if (percent === null) return null;
  if (percent >= 80) return { label: "Vas bien", color: "#2ecc71" };
  if (percent >= 50) return { label: "Vas justo", color: "#f1c40f" };
  return { label: "Vas mal", color: "#e74c3c" };
};

/**
 * Barra de progreso simple y reutilizable
 */
function ProgressBar({
  percent,
  color,
}: {
  percent: number | null;
  color: string;
}) {
  if (percent === null) return null;

  return (
    <View style={styles.progressContainer}>
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

// ===================================================
// COMPONENTE PRINCIPAL
// ===================================================

export default function TodayScreen() {
  // ---------------------------
  // ESTADOS
  // ---------------------------

  const [activeTripId, setActiveTripId] = useState<number | null>(null);
  const [trips, setTrips] = useState<TripRow[]>([]);

  const [lastPayment, setLastPayment] = useState<PaymentType>(PaymentType.CASH);
  const [lastSource, setLastSource] = useState<TripSource>(TripSource.TAXI);

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [payment, setPayment] = useState<PaymentType>(PaymentType.CASH);
  const [source, setSource] = useState<TripSource>(TripSource.TAXI);

  const [editingTrip, setEditingTrip] = useState<TripRow | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [refreshKey, setRefreshKey] = useState(0);

  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);

  const [showSummary, setShowSummary] = useState(false);

  const [showDailySummary, setShowDailySummary] = useState(true);

  const [goals, setGoals] = useState<{
    daily: number;
    weekly: number;
    monthly: number;
  }>({ daily: 0, weekly: 0, monthly: 0 });

  const [showGoals, setShowGoals] = useState(false);

  // Texto libre para tipo de viaje personalizado (CUSTOM)
  const [customSource, setCustomSource] = useState("");

  // Importe realmente cobrado por tarjeta (solo CARD)
  // Si es null, se asume igual al importe del servicio
  const [chargedAmountInput, setChargedAmountInput] = useState("");

  /**
   * Info del día de trabajo asociado a selectedDate.
   * - Si la fecha pertenece a un día de trabajo real: startTime / endTime / isClosed vendrán de BD.
   * - Si no pertenece a ninguno: vendrá null (y mostraremos un "día natural" virtual en UI).
   */
  const [workdayInfo, setWorkdayInfo] = useState<{
    startTime: string;
    endTime: string | null;
    isClosed: boolean;
  } | null>(null);

  /**---------------------------
   * ESTADO DÍA DE TRABAJO (ACTIVO)
   * ---------------------------
   */
  const [activeWorkday, setActiveWorkday] = useState<{
    id: number;
    startTime: string;
  } | null>(null);

  /**
   * Resumen DIARIO por workdayId (clave para que al cerrar el día no "se pierdan" viajes en los totales)
   * OJO: el nombre del campo es "freenow" porque así lo estás usando en UI.
   */
  const [dailySummary, setDailySummary] = useState<{
    total: number;
    taxi: number;
    uber: number;
    cabify: number;
    freeNow: number;
    efectivo: number;
    tarjeta: number;
    app: number;
    propinaTarjeta: number;
    propinaEfectivo: number;
  } | null>(null);

  // ---------------------------
  // CARGA DE DATOS
  // ---------------------------

  const refresh = async () => {
    const active = await TripService.getActiveTrip();
    setActiveTripId(active ? active.id : null);

    const tripsForDate = await TripService.getTripsForDate(selectedDate);
    setTrips(tripsForDate as TripRow[]);

    // Resumen semanal: lunes-domingo recortado al mes (lógica centralizada)
    const weekSummary = await SummaryService.getWeekSummary();
    setWeeklySummary(weekSummary);

    // Resumen mensual: desde día 1 hasta hoy
    const monthSummary = await SummaryService.getMonthSummary();
    setMonthlySummary(monthSummary);

    const workday = await TripService.getActiveWorkday();
    setActiveWorkday(workday);

    const wd = await TripService.getWorkdayInfoForDate(selectedDate);
    setWorkdayInfo(wd);

    // ✅ CLAVE: el resumen diario debe calcularse POR workdayId
    if (wd) {
      const summary = await TripService.getSummaryForWorkday(wd.id);
      setDailySummary(summary);
    } else {
      setDailySummary(null);
    }
  };

  useEffect(() => {
    refresh().catch(console.error);
  }, [selectedDate, refreshKey]);

  /**
   * Recarga las metas cada vez que esta pantalla
   * vuelve a estar activa (por ejemplo, al volver de /goals)
   */
  useFocusEffect(() => {
    GoalService.getGoals().then(setGoals);
  });

  // ---------------------------
  // ACCIONES
  // ---------------------------

  const handleStartTrip = async () => {
    await TripService.startTrip();
    setRefreshKey((k) => k + 1);
    await refresh();
  };

  const handleOpenFinish = () => {
    setEditingTrip(null);
    setPayment(lastPayment);
    setSource(lastSource);
    setCustomSource("");
    setAmountInput("");
    setShowFinishModal(true);
    setChargedAmountInput("");
  };

  const handleSave = async () => {
    const amount = Number(amountInput.replace(",", "."));
    if (isNaN(amount)) return;

    const chargedAmountValue =
  payment === PaymentType.CARD && chargedAmountInput.trim() !== ""
    ? Number(chargedAmountInput.replace(",", "."))
    : amount;
    if (isNaN(chargedAmountValue)) return;

    // ============================
    // RESOLVER TIPO DE VIAJE FINAL
    // ============================
    const finalSource =
      source === TripSource.CUSTOM && customSource.trim()
        ? customSource.trim()
        : source;

    // ============================
    // VIAJE MANUAL
    // ============================
    if (editingTrip && editingTrip.id === -1) {
      await TripService.createManualTrip({
        startTime: new Date(editingTrip.startTime),
        endTime: new Date(editingTrip.endTime ?? editingTrip.startTime),
        amount,
        payment,
        source: finalSource as any,
      });
    }
    // ============================
    // EDICIÓN NORMAL
    // ============================
    else if (editingTrip) {
      await TripService.updateTrip(
        editingTrip.id,
        amount,
        payment,
        finalSource as any
      );
    }
    // ============================
    // FINALIZAR VIAJE ACTIVO
    // ============================
    else {
      await TripService.finishActiveTripWithData(
        amount,
        payment,
        finalSource as any,
        chargedAmountValue.toString()
      );
      setLastPayment(payment);
      setLastSource(source);
    }

    // ============================
    // LIMPIEZA Y REFRESH
    // ============================
    setEditingTrip(null);
    setShowFinishModal(false);
    setAmountInput("");
    setCustomSource("");

    setRefreshKey((k) => k + 1);
    await refresh();
  };

  const handleDelete = async () => {
    if (!editingTrip) return;
    await TripService.deleteTrip(editingTrip.id);
    setEditingTrip(null);
    setShowFinishModal(false);

    setRefreshKey((k) => k + 1);
    await refresh();
  };

  // ---------------------------
  // CÁLCULOS
  // ---------------------------

  /**
   * Determina si la fecha seleccionada es "hoy" (día natural).
   * Se usa SOLO para UI: el Bloque B debe salir únicamente en días anteriores.
   */
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  /**
   * Información de día de trabajo "resuelta" para UI en días anteriores:
   * - Si existe workdayInfo real → se usa tal cual.
   * - Si NO existe → creamos un "día natural" (00:00–23:59) para evitar sensación de fallo.
   */
  const resolvedWorkdayInfo: {
    startTime: string;
    endTime: string | null;
    isClosed: boolean;
    isVirtual: boolean;
  } = workdayInfo
    ? {
        startTime: workdayInfo.startTime,
        endTime: workdayInfo.endTime,
        isClosed: workdayInfo.isClosed,
        isVirtual: false,
      }
    : {
        startTime: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          0,
          0,
          0
        ).toISOString(),
        endTime: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59
        ).toISOString(),
        isClosed: true,
        isVirtual: true,
      };

  /**
   * Total del día (POR WORKDAY).
   * Si por lo que sea dailySummary aún no llegó, hacemos fallback a los viajes cargados.
   */
  const totalToday = useMemo(() => {
    if (dailySummary) return dailySummary.total;
    return trips.reduce((acc, t) => acc + (t.amount ?? 0), 0);
  }, [dailySummary, trips]);

  /**
   * Diferencia respecto a metas
   * - Si la meta es 0 → no se muestra
   * - Nunca valores negativos
   */
  const remainingDaily =
    goals.daily > 0 ? Math.max(goals.daily - totalToday, 0) : null;

  const remainingWeekly =
    goals.weekly > 0 && weeklySummary
      ? Math.max(goals.weekly - weeklySummary.total, 0)
      : null;

  const remainingMonthly =
    goals.monthly > 0 && monthlySummary
      ? Math.max(goals.monthly - monthlySummary.total, 0)
      : null;

  /**
   * Totales por plataforma (Taxi / Uber / Cabify)
   */
  const totalsBySource = useMemo(() => {
    return {
      taxi: trips
        .filter((t) => t.source === TripSource.TAXI)
        .reduce((sum, t) => sum + (t.amount ?? 0), 0),

      uber: trips
        .filter((t) => t.source === TripSource.UBER)
        .reduce((sum, t) => sum + (t.amount ?? 0), 0),

      cabify: trips
        .filter((t) => t.source === TripSource.CABIFY)
        .reduce((sum, t) => sum + (t.amount ?? 0), 0),
    };
  }, [trips]);

  /**
   * Totales por tipo de dinero
   * - efectivo: lo que te quedas tú
   * - tarjeta: tarjeta + app (propietario)
   */
  const totalsByPayment = useMemo(() => {
    const efectivo = trips
      .filter((t) => t.payment === PaymentType.CASH)
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const tarjeta = trips
      .filter(
        (t) => t.payment === PaymentType.CARD || t.payment === PaymentType.APP
      )
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    return { efectivo, tarjeta };
  }, [trips]);

  // Progreso diario
  const dailyProgress = getProgress(totalToday, goals.daily);
  const dailyStatus = getStatus(dailyProgress);

  // Progreso semanal
  const weeklyProgress = getProgress(weeklySummary?.total ?? 0, goals.weekly);
  const weeklyStatus = getStatus(weeklyProgress);

  // Progreso mensual
  const monthlyProgress = getProgress(
    monthlySummary?.total ?? 0,
    goals.monthly
  );
  const monthlyStatus = getStatus(monthlyProgress);

  // ---------------------------
  // RENDER
  // ---------------------------

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>Taxi · Liquidación diaria</Text>

      {/* ===========================
          BLOQUE A - CONTROL DÍA DE TRABAJO (HOY)
      =========================== */}
      <View style={styles.card}>
        {activeWorkday ? (
          <>
            <Text style={{ fontWeight: "600" }}>Día de trabajo abierto</Text>
            <Text>
              Inicio: {new Date(activeWorkday.startTime).toLocaleString()}
            </Text>

            <View style={{ marginTop: 10 }}>
              <Button
                title="Cerrar día de trabajo"
                color="#cc3333"
                onPress={() => {
                  Alert.alert(
                    "Cerrar día de trabajo",
                    "Una vez cerrado no podrás añadir más viajes a este día.\n\n¿Deseas continuar?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Cerrar día",
                        style: "destructive",
                        onPress: async () => {
                          await TripService.closeActiveWorkday();
                          setRefreshKey((k) => k + 1);
                          await refresh();
                        },
                      },
                    ]
                  );
                }}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={{ fontWeight: "600" }}>
              No hay día de trabajo abierto
            </Text>

            <View style={{ marginTop: 10 }}>
              <Button
                title="Abrir día de trabajo"
                onPress={() => {
                  Alert.alert(
                    "Abrir día de trabajo",
                    "¿Seguro que quieres abrir un nuevo día de trabajo?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Abrir",
                        onPress: async () => {
                          await TripService.openWorkday();
                          setRefreshKey((k) => k + 1);
                          await refresh();
                        },
                      },
                    ]
                  );
                }}
              />
            </View>
          </>
        )}
      </View>

      {/* Selector de fecha */}
      <View style={styles.dateSelectorCompact}>
        <Pressable
          onPress={() =>
            setSelectedDate(
              new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000)
            )
          }
        >
          <Text style={styles.dateArrow}>‹</Text>
        </Pressable>

        <Text style={styles.dateTextCompact}>
          {selectedDate.toLocaleDateString()}
        </Text>

        <Pressable
          onPress={() =>
            setSelectedDate(
              new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
            )
          }
        >
          <Text style={styles.dateArrow}>›</Text>
        </Pressable>
      </View>

      {/* ===========================
          BLOQUE B - INFO DÍA DE TRABAJO (SOLO DÍAS ANTERIORES)
      =========================== */}
      {!isToday && (
        <View style={[styles.card, { backgroundColor: "#f5f7fa" }]}>
          <Text style={{ fontWeight: "600" }}>🚕 Día de trabajo</Text>

          <Text>
            Inicio: {new Date(resolvedWorkdayInfo.startTime).toLocaleString()}
          </Text>

          <Text>
            Fin:{" "}
            {resolvedWorkdayInfo.endTime
              ? new Date(resolvedWorkdayInfo.endTime).toLocaleString()
              : "En curso"}
          </Text>

          {!resolvedWorkdayInfo.isClosed && (
            <Text style={{ color: "#2ecc71", marginTop: 4 }}>
              ● Día de trabajo abierto
            </Text>
          )}

          {resolvedWorkdayInfo.isVirtual && (
            <Text style={{ color: "#999", marginTop: 4 }}>
              Día natural (sin cierre registrado)
            </Text>
          )}
        </View>
      )}

      {/* ===========================
          FILA ESTADO DEL DÍA
      =========================== */}
      <View style={styles.dayStatusRow}>
        <View style={[styles.card, styles.cardToday, styles.cardCompact]}>
          <Text style={styles.smallLabel}>Hoy</Text>
          <Text style={styles.amount}>{totalToday.toFixed(2)} €</Text>
        </View>

        {dailyStatus && (
          <View
            style={[
              styles.card,
              styles.cardProgress,
              styles.cardCompact,
              { borderLeftWidth: 4, borderLeftColor: dailyStatus.color },
            ]}
          >
            <Text style={styles.progressLine}>
              {dailyStatus.label} · {dailyProgress?.toFixed(0)}% · faltan{" "}
              {Math.max(goals.daily - totalToday, 0).toFixed(2)} €
            </Text>

            <ProgressBar percent={dailyProgress} color={dailyStatus.color} />
          </View>
        )}
      </View>

      {/* Toggle resumen diario */}
      <Pressable
        onPress={() => setShowDailySummary(!showDailySummary)}
        style={styles.summaryToggle}
      >
        <Text style={styles.summaryToggleText}>
          {showDailySummary ? "Ocultar detalle diario" : "Ver detalle diario"}
        </Text>
      </Pressable>

      {/* Resumen diario */}
      {showDailySummary && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumen del día</Text>

          <View style={styles.tableRow}>
            <Text>Taxi</Text>
            <Text>{(dailySummary?.taxi ?? 0).toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>Uber</Text>
            <Text>{(dailySummary?.uber ?? 0).toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>Cabify</Text>
            <Text>{(dailySummary?.cabify ?? 0).toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>FreeNow</Text>
            <Text>{(dailySummary?.freeNow ?? 0).toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>Efectivo (tú)</Text>
            <Text>{(dailySummary?.efectivo ?? 0).toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>Tarjeta</Text>
            <Text>{(dailySummary?.tarjeta ?? 0).toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>App</Text>
            <Text>{(dailySummary?.app ?? 0).toFixed(2)} €</Text>
          </View>

{/* ---------------------------
    PROPINA (NO CUENTA COMO RECAUDACIÓN)
---------------------------- */}
<View
  style={{
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  }}
>
  <Text style={{ fontWeight: "600", marginBottom: 4 }}>
    Propinas
  </Text>

  <View style={styles.tableRow}>
    <Text>Tarjeta</Text>
    <Text>
      {(dailySummary?.propinaTarjeta ?? 0).toFixed(2)} €
    </Text>
  </View>

  <View style={styles.tableRow}>
    <Text>Efectivo</Text>
    <Text>
      {(dailySummary?.propinaEfectivo ?? 0).toFixed(2)} €
    </Text>
  </View>
</View>


        </View>
      )}

      {/* Toggle metas */}
      <Pressable
        onPress={() => setShowGoals(!showGoals)}
        style={styles.summaryToggle}
      >
        <Text style={styles.summaryToggleText}>
          {showGoals ? "Ocultar metas" : "Ver metas"}
        </Text>
      </Pressable>

      {showGoals && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Metas</Text>

          <Text>
            Día: {totalToday.toFixed(2)} € / {goals.daily.toFixed(2)} €
          </Text>
          {remainingDaily !== null && (
            <Text>Te faltan {remainingDaily.toFixed(2)} € hoy</Text>
          )}

          <Text style={{ marginTop: 6 }}>
            Semana: {weeklySummary?.total.toFixed(2)} € /{" "}
            {goals.weekly.toFixed(2)} €
          </Text>
          {remainingWeekly !== null && (
            <Text>Te faltan {remainingWeekly.toFixed(2)} € esta semana</Text>
          )}

          <Text style={{ marginTop: 6 }}>
            Mes: {monthlySummary?.total.toFixed(2)} € /{" "}
            {goals.monthly.toFixed(2)} €
          </Text>
          {remainingMonthly !== null && (
            <Text>Te faltan {remainingMonthly.toFixed(2)} € este mes</Text>
          )}
        </View>
      )}

      <Button title="Editar metas" onPress={() => router.push("/goals")} />

      {/* Toggle resumen */}
      <Pressable
        onPress={() => setShowSummary(!showSummary)}
        style={styles.summaryToggle}
      >
        <Text style={styles.summaryToggleText}>
          {showSummary ? "Ocultar resumen" : "Ver resumen semanal / mensual"}
        </Text>
      </Pressable>

      {/* Resumen compacto */}
      {showSummary && weeklySummary && monthlySummary && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={[styles.tableRow, { marginBottom: 6 }]}>
            <Text style={{ fontWeight: "600" }}></Text>
            <Text style={{ fontWeight: "600" }}>Semana</Text>
            <Text style={{ fontWeight: "600" }}>Mes</Text>
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
            <View key={key} style={styles.tableRow}>
              <Text>{label}</Text>
              <Text>{weeklySummary[key].toFixed(2)} €</Text>
              <Text>{monthlySummary[key].toFixed(2)} €</Text>
            </View>
          ))}
        </View>
      )}

      {/* Botón principal */}
      {activeWorkday ? (
        !activeTripId ? (
          <Button title="Iniciar viaje" onPress={handleStartTrip} />
        ) : (
          <Button title="Finalizar viaje" onPress={handleOpenFinish} />
        )
      ) : (
        <Text style={{ textAlign: "center", color: "#777", marginBottom: 10 }}>
          Abre un día de trabajo para empezar a registrar viajes
        </Text>
      )}

      <Button
        title="Añadir viaje manual"
        onPress={() => {
          setEditingTrip({
            id: -1, // id ficticio para identificar manual
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            amount: null,
            payment: PaymentType.CASH,
            source: TripSource.TAXI,
          } as any);
          setAmountInput("");
          setPayment(PaymentType.CASH);
          setSource(TripSource.TAXI);
          setShowFinishModal(true);
        }}
      />

      {/* Lista de viajes */}
      <FlatList
        data={trips}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (!item.endTime) return;
              setEditingTrip(item);
              setAmountInput(String(item.amount ?? ""));
              setPayment(item.payment ?? PaymentType.CASH);
              setSource(item.source);
              setShowFinishModal(true);
            }}
          >
            <Text style={styles.tripText}>
              {new Date(item.startTime).toLocaleTimeString()} →{" "}
              {item.endTime
                ? new Date(item.endTime).toLocaleTimeString()
                : "..."}{" "}
              · {item.amount ?? ""} €
            </Text>
          </Pressable>
        )}
      />

      <Button
        title="Exportar viajes (CSV)"
        onPress={() => ExportService.exportTripsToCSV()}
      />

      {/* ===========================
          MODAL FINALIZAR / EDITAR VIAJE
      =========================== */}
      <Modal visible={showFinishModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingTrip ? "Editar viaje" : "Finalizar viaje"}
            </Text>

            {/* IMPORTE */}
            <Text>Importe (€)</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="decimal-pad"
              placeholder="0,00"
              autoFocus
              style={styles.input}
            />

            {/* IMPORTE COBRADO (SOLO TARJETA) */}
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

            {/* FORMA DE PAGO */}
            <Text style={{ marginTop: 10 }}>Forma de pago</Text>
            <View style={styles.row}>
              {[PaymentType.CASH, PaymentType.CARD, PaymentType.APP].map(
                (p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPayment(p)}
                    style={[styles.chip, payment === p && styles.chipActive]}
                  >
                    <Text>{p}</Text>
                  </Pressable>
                )
              )}
            </View>

            {/* TIPO DE VIAJE */}
            <Text style={{ marginTop: 10 }}>Tipo de viaje</Text>
            <View style={styles.row}>
              {[
                TripSource.TAXI,
                TripSource.UBER,
                TripSource.CABIFY,
                TripSource.FREE_NOW,
              ].map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSource(s)}
                  style={[styles.chip, source === s && styles.chipActive]}
                >
                  <Text>{s}</Text>
                </Pressable>
              ))}
            </View>

            {/* BOTONES */}
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setEditingTrip(null);
                  setShowFinishModal(false);
                }}
              />
              <Button title="Guardar" onPress={handleSave} />
            </View>

            {/* BORRAR SOLO SI EDITAMOS */}
            {editingTrip && (
              <View style={{ marginTop: 10 }}>
                <Button
                  title="Borrar viaje"
                  color="red"
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
                      ]
                    );
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ===================================================
// ESTILOS
// ===================================================

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },

  dateSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  dateButton: { fontSize: 22, paddingHorizontal: 20 },
  dateText: { fontWeight: "600" },

  card: {
    backgroundColor: "#eee",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  amount: { fontSize: 23, fontWeight: "bold" },

  sectionTitle: { fontWeight: "600", marginBottom: 6 },
  summaryToggle: { alignSelf: "center", marginBottom: 10 },
  summaryToggleText: { color: "#0066cc", fontWeight: "600" },

  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  tripText: { paddingVertical: 6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  modalTitle: { fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#eee",
    borderRadius: 22,
  },
  chipActive: {
    backgroundColor: "#4da6ff",
  },

  progressContainer: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },

  dailyCompact: {
    borderLeftWidth: 4,
    paddingVertical: 10,
  },

  dailyCompactText: {
    fontWeight: "600",
    marginBottom: 6,
  },

  dateSelectorCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  dateArrow: {
    fontSize: 20,
    paddingHorizontal: 12,
    color: "#333",
  },

  dateTextCompact: {
    fontWeight: "600",
    fontSize: 14,
    minWidth: 110,
    textAlign: "center",
  },

  dayStatusRow: {
    flexDirection: "row",
    gap: 10,
  },

  cardToday: {
    flex: 0.33, // ~33%
    paddingVertical: 12,
  },

  cardProgress: {
    flex: 0.67, // ~67%
    paddingVertical: 12,
  },

  smallLabel: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
  },

  progressLine: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },

  cardCompact: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
});

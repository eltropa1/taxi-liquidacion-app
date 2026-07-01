import { useMemo, useState } from "react";
import {
  Button,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaymentType, TripSource } from "../src/constants/enums";
import { useTodayScreen, type TodayTripRow } from "../src/hooks/useTodayScreen";
import { TripHistory } from "../src/components/trip-history";
import { buildTodayScreenProjection, toTripVisualProjection } from "../src/presentation";
import { useTripActions } from "../src/hooks/useTripActions";
import { ExportService } from "../src/application/runtime";

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

  const [lastPayment, setLastPayment] = useState<PaymentType>(PaymentType.CASH);
  const [lastSource, setLastSource] = useState<TripSource>(TripSource.TAXI);

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [payment, setPayment] = useState<PaymentType>(PaymentType.CASH);
  const [source, setSource] = useState<TripSource>(TripSource.TAXI);

  const [editingTrip, setEditingTrip] = useState<TodayTripRow | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [showSummary, setShowSummary] = useState(false);

  const [showDailySummary, setShowDailySummary] = useState(true);

  const [showGoals, setShowGoals] = useState(false);

  // Texto libre para tipo de viaje personalizado (CUSTOM)
  const [customSource, setCustomSource] = useState("");

  // Importe realmente cobrado por tarjeta (solo CARD)
  // Si es null, se asume igual al importe del servicio
  const [chargedAmountInput, setChargedAmountInput] = useState("");

  // Propina en efectivo (opcional)
  const [cashTipInput, setCashTipInput] = useState("");

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

  // ---------------------------
  // ACCIONES
  // ---------------------------

  const handleOpenFinish = () => {
    setEditingTrip(null);
    setPayment(lastPayment);
    setSource(lastSource);
    setCustomSource("");
    setAmountInput("");
    setShowFinishModal(true);
    setChargedAmountInput("");
    setCashTipInput("");
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

  // ---------------------------
  // CÁLCULOS
  // ---------------------------

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
                          await handleCloseWorkday();
                        },
                      },
                    ],
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
                          await handleOpenWorkday();
                        },
                      },
                    ],
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
              new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000),
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
              new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
            )
          }
        >
          <Text style={styles.dateArrow}>›</Text>
        </Pressable>
      </View>

      {/* ===========================
          BLOQUE B - INFO DÍA DE TRABAJO (SOLO DÍAS ANTERIORES)
      =========================== */}
      {!todayProjection.isToday && (
        <View style={[styles.card, { backgroundColor: "#f5f7fa" }]}>
          <Text style={{ fontWeight: "600" }}>🚕 Día de trabajo</Text>

          <Text>
            Inicio:{" "}
            {new Date(todayProjection.resolvedWorkdayInfo.startTime).toLocaleString()}
          </Text>

          <Text>
            Fin:{" "}
            {todayProjection.resolvedWorkdayInfo.endTime
              ? new Date(todayProjection.resolvedWorkdayInfo.endTime).toLocaleString()
              : "En curso"}
          </Text>

          {!todayProjection.resolvedWorkdayInfo.isClosed && (
            <Text style={{ color: "#2ecc71", marginTop: 4 }}>
              ● Día de trabajo abierto
            </Text>
          )}

          {todayProjection.resolvedWorkdayInfo.isVirtual && (
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
          <Text style={styles.amount}>{todayProjection.totalToday.toFixed(2)} €</Text>
        </View>

        {todayProjection.dailyStatus && (
          <View
            style={[
              styles.card,
              styles.cardProgress,
              styles.cardCompact,
              { borderLeftWidth: 4, borderLeftColor: todayProjection.dailyStatus.color },
            ]}
          >
            <Text style={styles.progressLine}>
              {todayProjection.dailyStatus.label} · {todayProjection.dailyProgress?.toFixed(0)}% · faltan{" "}
              {Math.max(goals.daily - todayProjection.totalToday, 0).toFixed(2)} €
            </Text>

            <ProgressBar percent={todayProjection.dailyProgress} color={todayProjection.dailyStatus.color} />
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
            <Text style={{ fontWeight: "600", marginBottom: 4 }}>Propinas</Text>

            <View style={styles.tableRow}>
              <Text>Tarjeta</Text>
              <Text>{(dailySummary?.propinaTarjeta ?? 0).toFixed(2)} €</Text>
            </View>

            <View style={styles.tableRow}>
              <Text>Efectivo</Text>
              <Text>{(dailySummary?.propinaEfectivo ?? 0).toFixed(2)} €</Text>
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
            Día: {todayProjection.totalToday.toFixed(2)} € / {goals.daily.toFixed(2)} €
          </Text>
          {todayProjection.remainingDaily !== null && (
            <Text>Te faltan {todayProjection.remainingDaily.toFixed(2)} € hoy</Text>
          )}

          <Text style={{ marginTop: 6 }}>
            Semana: {weeklySummary?.total.toFixed(2)} € /{" "}
            {goals.weekly.toFixed(2)} €
          </Text>
          {todayProjection.remainingWeekly !== null && (
            <Text>Te faltan {todayProjection.remainingWeekly.toFixed(2)} € esta semana</Text>
          )}

          <Text style={{ marginTop: 6 }}>
            Mes: {monthlySummary?.total.toFixed(2)} € /{" "}
            {goals.monthly.toFixed(2)} €
          </Text>
          {todayProjection.remainingMonthly !== null && (
            <Text>Te faltan {todayProjection.remainingMonthly.toFixed(2)} € este mes</Text>
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

      <TripHistory
        trips={tripHistoryProjections}
        onTripPress={(tripId) =>
          router.push({
            pathname: "/trip/edit",
            params: { tripId },
          })
        }
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
            <Text>Importe del Viaje(€)</Text>
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

            {/* PROPINA EFECTIVO (SOLO CASH) */}
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
                ),
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
                      ],
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

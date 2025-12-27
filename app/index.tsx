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
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaymentType, TripSource } from "../src/constants/enums";
import { ExportService } from "../src/services/ExportService";
import { GoalService } from "../src/services/GoalService";
import { TripService } from "../src/services/TripService";

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

// ===================================================
// FUNCIONES AUXILIARES DE FECHAS (FUERA DEL COMPONENTE)
// ===================================================

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay() || 7; // lunes
  d.setDate(d.getDate() - day + 1);
  return d;
};

const endOfWeek = (date: Date) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  return d;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

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


  // ---------------------------
  // CARGA DE DATOS
  // ---------------------------

  const refresh = async () => {
    const active = await TripService.getActiveTrip();
    setActiveTripId(active ? active.id : null);

    const tripsForDate = await TripService.getTripsForDate(selectedDate);
    setTrips(tripsForDate as TripRow[]);

    const weekSummary = await TripService.getSummaryBetweenDates(
      startOfWeek(selectedDate),
      endOfWeek(selectedDate)
    );
    setWeeklySummary(weekSummary);

    const monthSummary = await TripService.getSummaryBetweenDates(
      startOfMonth(selectedDate),
      endOfMonth(selectedDate)
    );
    setMonthlySummary(monthSummary);

    const workday = await TripService.getActiveWorkday();
setActiveWorkday(workday);

  };

  useEffect(() => {
    refresh().catch(console.error);
  }, [selectedDate]);

/**---------------------------
 * ESTADO DÍA DE TRABAJO
 * ---------------------------
 */

const [activeWorkday, setActiveWorkday] = useState<{
  id: number;
  startTime: string;
} | null>(null);


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
    await refresh();
  };

  const handleOpenFinish = () => {
    setEditingTrip(null);
    setPayment(lastPayment);
    setSource(lastSource);
    setAmountInput("");
    setShowFinishModal(true);
  };

  const handleSave = async () => {
    const amount = Number(amountInput.replace(",", "."));
    if (isNaN(amount)) return;

    if (editingTrip) {
      await TripService.updateTrip(editingTrip.id, amount, payment, source);
    } else {
      await TripService.finishActiveTripWithData(amount, payment, source);
      setLastPayment(payment);
      setLastSource(source);
    }

    setEditingTrip(null);
    setShowFinishModal(false);
    setAmountInput("");
    await refresh();
  };

  const handleDelete = async () => {
    if (!editingTrip) return;
    await TripService.deleteTrip(editingTrip.id);
    setEditingTrip(null);
    setShowFinishModal(false);
    await refresh();
  };

  // ---------------------------
  // CÁLCULOS
  // ---------------------------

  const totalToday = useMemo(
    () => trips.reduce((acc, t) => acc + (t.amount ?? 0), 0),
    [trips]
  );
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
const weeklyProgress = getProgress(
  weeklySummary?.total ?? 0,
  goals.weekly
);
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
    CONTROL DÍA DE TRABAJO
=========================== */}
<View style={styles.card}>
  {activeWorkday ? (
    <>
      <Text style={{ fontWeight: "600" }}>
        Día de trabajo abierto
      </Text>
      <Text>
        Inicio: {new Date(activeWorkday.startTime).toLocaleString()}
      </Text>

      <View style={{ marginTop: 10 }}>
        <Button
          title="Cerrar día de trabajo"
          color="#cc3333"
          onPress={async () => {
            await TripService.closeActiveWorkday();
            await refresh();
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
          onPress={async () => {
            await TripService.openWorkday();
            await refresh();
          }}
        />
      </View>
    </>
  )}
</View>


      {/* Selector de fecha */}
      <View style={styles.dateSelector}>
        <Pressable
          onPress={() =>
            setSelectedDate(
              new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000)
            )
          }
        >
          <Text style={styles.dateButton}>◀</Text>
        </Pressable>

        <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>

        <Pressable
          onPress={() =>
            setSelectedDate(
              new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
            )
          }
        >
          <Text style={styles.dateButton}>▶</Text>
        </Pressable>
      </View>

      {/* Total del día */}
      <View style={styles.card}>
        <Text>Total del día</Text>
        <Text style={styles.amount}>{totalToday.toFixed(2)} €</Text>
      </View>

      {/* Indiciador diario */}
          {dailyStatus && (
  <View style={[styles.card, { borderLeftWidth: 6, borderLeftColor: dailyStatus.color }]}>
    <Text style={{ fontWeight: "600" }}>
      {dailyStatus.label}
    </Text>

    <Text>
      Progreso: {dailyProgress?.toFixed(0)} %
    </Text>

    <ProgressBar
  percent={dailyProgress}
  color={dailyStatus.color}
/>

    <Text>
      Te faltan: {Math.max(goals.daily - totalToday, 0).toFixed(2)} €
    </Text>
  </View>
)}
// TODO UI:
// Los indicadores semanal y mensual ocupan demasiado espacio en móvil.
// Propuesta futura:
// - Unificarlos en una sola tarjeta compacta
// - Añadir botón desplegar/ocultar
// - Mantener solo barras finas + texto
{/*
 Indicador semanal 
{weeklyStatus && (
  <View style={[styles.card, { borderLeftWidth: 6, borderLeftColor: weeklyStatus.color }]}>
    <Text style={{ fontWeight: "600" }}>{weeklyStatus.label} (Semana)</Text>

    <Text>Progreso: {weeklyProgress?.toFixed(0)} %</Text>

    <ProgressBar percent={weeklyProgress} color={weeklyStatus.color} />

    {remainingWeekly !== null && (
      <Text>Te faltan {remainingWeekly.toFixed(2)} € esta semana</Text>
    )}
  </View>
)}
{/* Indicador mensual *
{monthlyStatus && (
  <View style={[styles.card, { borderLeftWidth: 6, borderLeftColor: monthlyStatus.color }]}>
    <Text style={{ fontWeight: "600" }}>{monthlyStatus.label} (Mes)</Text>

    <Text>Progreso: {monthlyProgress?.toFixed(0)} %</Text>

    <ProgressBar percent={monthlyProgress} color={monthlyStatus.color} />

    {remainingMonthly !== null && (
      <Text>Te faltan {remainingMonthly.toFixed(2)} € este mes</Text>
    )}
  </View>
)}
*/}
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
            <Text>{totalsBySource.taxi.toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>Uber</Text>
            <Text>{totalsBySource.uber.toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>Cabify</Text>
            <Text>{totalsBySource.cabify.toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>Efectivo (tú)</Text>
            <Text>{totalsByPayment.efectivo.toFixed(2)} €</Text>
          </View>

          <View style={styles.tableRow}>
            <Text>Tarjeta / App</Text>
            <Text>{totalsByPayment.tarjeta.toFixed(2)} €</Text>
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



<View style={styles.card}>
  <Text>
    Te faltan:{" "}
    {Math.max(goals.daily - totalToday, 0).toFixed(2)} € hoy
  </Text>
</View>


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
            ["Efectivo", "efectivo"],
            ["Tarjeta / App", "tarjeta"],
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

      {/* FORMA DE PAGO */}
      <Text style={{ marginTop: 10 }}>Forma de pago</Text>
      <View style={styles.row}>
        {[PaymentType.CASH, PaymentType.CARD, PaymentType.APP].map((p) => (
          <Pressable
            key={p}
            onPress={() => setPayment(p)}
            style={[
              styles.chip,
              payment === p && styles.chipActive,
            ]}
          >
            <Text>{p}</Text>
          </Pressable>
        ))}
      </View>

      {/* TIPO DE VIAJE */}
      <Text style={{ marginTop: 10 }}>Tipo de viaje</Text>
      <View style={styles.row}>
        {[TripSource.TAXI, TripSource.UBER, TripSource.CABIFY].map((s) => (
          <Pressable
            key={s}
            onPress={() => setSource(s)}
            style={[
              styles.chip,
              source === s && styles.chipActive,
            ]}
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
            onPress={handleDelete}
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
  amount: { fontSize: 24, fontWeight: "bold" },
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

});

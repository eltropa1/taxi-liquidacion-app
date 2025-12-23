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

import { PaymentType, TripSource } from "../src/constants/enums";
import { TripService } from "../src/services/TripService";

type TripRow = {
  id: number;
  startTime: string;
  endTime: string | null;
  amount: number | null;
};

/**
 * Pantalla principal - HOY
 */
export default function TodayScreen() {
  // ---------------------------
  // ESTADOS
  // ---------------------------
  const [activeTripId, setActiveTripId] = useState<number | null>(null);
  const [trips, setTrips] = useState<TripRow[]>([]);
  // Preferencias rápidas (se recuerdan durante la sesión)
  const [lastPayment, setLastPayment] = useState<PaymentType>(PaymentType.CASH);
  const [lastSource, setLastSource] = useState<TripSource>(TripSource.TAXI);

  // Modal finalizar
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [payment, setPayment] = useState<PaymentType>(PaymentType.CASH);
  const [source, setSource] = useState<TripSource>(TripSource.TAXI);

  // ---------------------------
  // CARGA DE DATOS
  // ---------------------------
  const refresh = async () => {
    const active = await TripService.getActiveTrip();
    setActiveTripId(active ? active.id : null);

    const todayTrips = await TripService.getTripsForToday();
    setTrips(todayTrips);
  };

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  // ---------------------------
  // ACCIONES
  // ---------------------------
  const handleStartTrip = async () => {
    await TripService.startTrip();
    await refresh();
  };

  const handleOpenFinish = () => {
    setPayment(lastPayment);
    setSource(lastSource);
    setShowFinishModal(true);
  };

  const handleSaveFinish = async () => {
    const amount = Number(amountInput.replace(",", "."));
    if (isNaN(amount)) return;

    await TripService.finishActiveTripWithData(amount, payment, source);

    setLastPayment(payment);
    setLastSource(source);

    setShowFinishModal(false);
    setAmountInput("");
    await refresh();
  };

  // ---------------------------
  // TOTAL DEL DÍA
  // ---------------------------
  const totalToday = useMemo(
    () => trips.reduce((acc, t) => acc + (t.amount ?? 0), 0),
    [trips]
  );

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Taxi · Liquidación diaria</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>

      <View style={styles.card}>
        <Text>Total hoy</Text>
        <Text style={styles.amount}>{totalToday.toFixed(2)} €</Text>
      </View>

      {!activeTripId ? (
        <Button title="Iniciar viaje" onPress={handleStartTrip} />
      ) : (
        <Button title="Finalizar viaje" onPress={handleOpenFinish} />
      )}

      <FlatList
        data={trips}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <Text style={styles.tripText}>
            {new Date(item.startTime).toLocaleTimeString()} →{" "}
            {item.endTime ? new Date(item.endTime).toLocaleTimeString() : "..."}
          </Text>
        )}
      />

      {/* MODAL FINALIZAR */}
      <Modal visible={showFinishModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Finalizar viaje</Text>

            <Text>Importe (€)</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="decimal-pad"
              autoFocus
              returnKeyType="done"
              placeholder="0,00"
              style={styles.input}
            />

            <Text>Forma de pago</Text>
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

            <Text>Tipo de viaje</Text>
            <View style={styles.row}>
              {[TripSource.TAXI, TripSource.UBER, TripSource.CABIFY].map(
                (s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSource(s)}
                    style={[styles.chip, source === s && styles.chipActive]}
                  >
                    <Text>{s}</Text>
                  </Pressable>
                )
              )}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => setShowFinishModal(false)}
              />
              <Button title="Guardar" onPress={handleSaveFinish} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------------------------
// ESTILOS
// ---------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  date: { textAlign: "center", marginBottom: 20 },
  card: {
    padding: 20,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 12,
  },
  amount: { fontSize: 24, fontWeight: "bold" },
  tripText: { paddingVertical: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 },
  row: { flexDirection: "row", gap: 8, marginVertical: 8 },
  chip: { 
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#eee", 
    borderRadius: 22
  },
  chipActive: { backgroundColor: "#4da6ff" },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});

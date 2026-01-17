import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { TripService } from "../../src/services/TripService";
import { PaymentType, TripSource } from "../../src/constants/enums";

export default function EditTripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  const [loading, setLoading] = useState(true);

  const [amountInput, setAmountInput] = useState("");
  const [payment, setPayment] = useState<PaymentType>(PaymentType.CASH);
  const [source, setSource] = useState<TripSource>(TripSource.TAXI);
  const [chargedAmountInput, setChargedAmountInput] = useState("");
  const [cashTipInput, setCashTipInput] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [endTimeInput, setEndTimeInput] = useState("");

  const [trip, setTrip] = useState<any>(null);

  useEffect(() => {
    if (!tripId) return;

    const load = async () => {
      const t = await TripService.getTripById(Number(tripId));
      if (!t) {
        Alert.alert("Error", "No se ha encontrado el viaje");
        router.back();
        return;
      }

      setTrip(t);
      setAmountInput(String(t.amount ?? ""));
      setPayment(t.payment ?? PaymentType.CASH);
      setSource(t.source);

      setChargedAmountInput(
        t.chargedAmount !== null && t.chargedAmount !== undefined
          ? String(t.chargedAmount)
          : "",
      );

      setCashTipInput(
        t.cashTip !== null && t.cashTip !== undefined ? String(t.cashTip) : "",
      );

      // ---------------------------
      // Cargar horas (HH:mm)
      // ---------------------------
      const start = new Date(t.startTime);
      const end = t.endTime ? new Date(t.endTime) : start;

      setStartTimeInput(
        `${start.getHours().toString().padStart(2, "0")}:${start
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
      );

      setEndTimeInput(
        `${end.getHours().toString().padStart(2, "0")}:${end
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
      );

      setLoading(false);
    };

    load().catch(console.error);
  }, [tripId]);

  // ---------------------------
  // GUARDAR
  // ---------------------------
  const handleSave = async () => {
    // ---------------------------
    // VALIDACIÓN Y CÁLCULO DE HORAS
    // ---------------------------
    const parseTime = (value: string): { h: number; m: number } | null => {
      const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
      if (!match) return null;

      const h = Number(match[1]);
      const m = Number(match[2]);

      if (h < 0 || h > 23 || m < 0 || m > 59) return null;
      return { h, m };
    };

    const startParsed = parseTime(startTimeInput);
    const endParsed = parseTime(endTimeInput);

    if (!startParsed || !endParsed) {
      Alert.alert("Hora inválida", "Introduce las horas en formato HH:mm");
      return;
    }

    // Construimos nuevas fechas usando el día original
    const baseDate = new Date(trip.startTime);

    const newStartTime = new Date(baseDate);
    newStartTime.setHours(startParsed.h, startParsed.m, 0, 0);

    const newEndTime = new Date(baseDate);
    newEndTime.setHours(endParsed.h, endParsed.m, 0, 0);

    // Validación lógica
    if (newEndTime < newStartTime) {
      Alert.alert(
        "Horas incorrectas",
        "La hora de fin no puede ser anterior a la de inicio.",
      );
      return;
    }

    const amount = Number(amountInput.replace(",", "."));
    if (isNaN(amount)) return;

    let chargedAmountValue: number | undefined = undefined;
    let cashTipValue: number | undefined = undefined;

    if (payment === PaymentType.CARD) {
      let resolvedChargedAmount: number = trip.chargedAmount ?? amount;

      if (chargedAmountInput.trim() !== "") {
        const parsed = Number(chargedAmountInput.replace(",", "."));
        if (isNaN(parsed)) {
          Alert.alert("Importe inválido", "Importe cobrado no válido.");
          return;
        }
        resolvedChargedAmount = parsed;
      }

      // 🚨 VALIDACIÓN CRÍTICA
      if (resolvedChargedAmount < amount) {
        Alert.alert(
          "Importe incorrecto",
          "El importe cobrado no puede ser menor que el importe del viaje.",
        );
        return;
      }
      chargedAmountValue = resolvedChargedAmount;
    }

    if (payment === PaymentType.CASH) {
      let resolvedCashCharged: number = amount + (trip.cashTip ?? 0);

      if (cashTipInput.trim() !== "") {
        const parsed = Number(cashTipInput.replace(",", "."));
        if (isNaN(parsed)) {
          Alert.alert("Importe inválido", "Importe cobrado no válido.");
          return;
        }
        resolvedCashCharged = parsed;
      }

      // 🚨 VALIDACIÓN EN EDICIÓN (MISMA QUE TARJETA)
      if (resolvedCashCharged < amount) {
        Alert.alert(
          "Importe incorrecto",
          "El importe cobrado no puede ser menor que el importe del viaje.",
        );
        return;
      }

      // 🔁 Traducción interna
      cashTipValue = resolvedCashCharged - amount;
    }

    // ---------------------------
    // GUARDAR HORAS DEL VIAJE
    // ---------------------------
    await TripService.updateTripTimes(trip.id, newStartTime, newEndTime);

    // ---------------------------
    // GUARDAR DATOS ECONÓMICOS
    // ---------------------------
    await TripService.updateTrip(
      trip.id,
      amount,
      payment,
      source as any,
      undefined,
      chargedAmountValue,
      cashTipValue,
    );

    // ---------------------------
    // VOLVER
    // ---------------------------
    router.back();
  };

  // ---------------------------
  // BORRAR
  // ---------------------------
  const handleDelete = async () => {
    Alert.alert(
      "Borrar viaje",
      "Esta acción no se puede deshacer.\n\n¿Seguro que quieres borrar este viaje?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            await TripService.deleteTrip(trip.id);
            router.back();
          },
        },
      ],
    );
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando viaje...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar viaje</Text>

      {/* ---------------------------
    HORAS DEL VIAJE
---------------------------- */}
      <Text style={{ marginTop: 10 }}>Hora inicio (HH:mm)</Text>
      <TextInput
        value={startTimeInput}
        onChangeText={setStartTimeInput}
        placeholder="08:30"
        style={styles.input}
      />

      <Text style={{ marginTop: 10 }}>Hora fin (HH:mm)</Text>
      <TextInput
        value={endTimeInput}
        onChangeText={setEndTimeInput}
        placeholder="09:10"
        style={styles.input}
      />

      <Text>Importe del viaje (€)</Text>
      <TextInput
        value={amountInput}
        onChangeText={setAmountInput}
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Text style={{ marginTop: 10 }}>Forma de pago</Text>
      <View style={styles.row}>
        {[PaymentType.CASH, PaymentType.CARD, PaymentType.APP].map((p) => (
          <Pressable
            key={p}
            onPress={() => setPayment(p)}
            style={[styles.chip, payment === p && styles.chipActive]}
          >
            <Text>{p}</Text>
          </Pressable>
        ))}
        {/* Propina Tarjeta */}
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

        {/* Pronina efectivo */}
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

        {/*  find de propina efectiva */}
      </View>

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

      <View style={{ marginTop: 20 }}>
        <Button title="Guardar" onPress={handleSave} />
      </View>

      <View style={{ marginTop: 10 }}>
        <Button title="Borrar viaje" color="red" onPress={handleDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
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
});

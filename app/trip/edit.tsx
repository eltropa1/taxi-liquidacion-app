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

import { TripService } from "../../src/application/runtime";
import { PaymentType, TripSource } from "../../src/constants/enums";
import { NeighborhoodSelector } from "../../src/components/forms/NeighborhoodSelector";
import { prepareTripEditSaveData } from "../../src/domain/trips/tripEditPreparation";
import { UpdateTrip } from "../../src/application/trips/UpdateTrip";
import { DeleteTrip } from "../../src/application/trips/DeleteTrip";
import {
  resolveEffectiveNeighborhoodName,
  resolveTripEditClock,
  resolveTripEditSnapshotZones,
} from "../../src/presentation";


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

  // ---------------------------
// ZONAS GEO AUTOMÁTICAS (SOLO UI)
// ---------------------------
const [geoPickupZone, setGeoPickupZone] = useState<string | null>(null);
const [geoDropoffZone, setGeoDropoffZone] = useState<string | null>(null);


  // ---------------------------
  // ZONAS (EDICIÓN MANUAL)
  // ---------------------------
  const [manualPickupZone, setManualPickupZone] = useState<string | null>(null);
  const [manualDropoffZone, setManualDropoffZone] = useState<string | null>(
    null,
  );

  const [showPickupSelector, setShowPickupSelector] = useState(false);
  const [showDropoffSelector, setShowDropoffSelector] = useState(false);

  useEffect(() => {
    if (!tripId) return;

    const load = async () => {
      const t = await TripService.getTripById(Number(tripId));
      if (!t) {
        Alert.alert("Error", "No se ha encontrado el viaje");
        router.back();
        return;
      }

      // ---------------------------
// Resolver zonas GEO automáticas (START / END)
// ---------------------------
      const snapshots = await TripService.getTripGeoSnapshots(t.id);
      const { geoPickupZone, geoDropoffZone } =
        resolveTripEditSnapshotZones(snapshots);

      setGeoPickupZone(geoPickupZone);
      setGeoDropoffZone(geoDropoffZone);


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
  t.cashTip !== null && t.cashTip !== undefined
    ? String((t.amount ?? 0) + t.cashTip)
    : ""
);


      // ---------------------------
      // Cargar horas (HH:mm)
      // ---------------------------
      const start = new Date(t.startTime);
      const end = t.endTime ? new Date(t.endTime) : start;

      setStartTimeInput(resolveTripEditClock(start.toISOString()));
      setEndTimeInput(resolveTripEditClock(end.toISOString()));
      // ---------------------------
      // Cargar zonas manuales (si existen)
      // ---------------------------
      setManualPickupZone(t.manualPickupZone ?? null);
      setManualDropoffZone(t.manualDropoffZone ?? null);

      setLoading(false);
    };

    load().catch(console.error);
  }, [tripId]);

  // ---------------------------
  // GUARDAR
  // ---------------------------
  const handleSave = async () => {
    const prepared = prepareTripEditSaveData({
      tripStartTime: trip.startTime,
      amountInput,
      payment,
      chargedAmountInput,
      cashTipInput,
      startTimeInput,
      endTimeInput,
      existingChargedAmount: trip.chargedAmount,
      existingCashTip: trip.cashTip,
    });

    if (!prepared.ok) {
      if (prepared.error === "INVALID_AMOUNT") return;

      if (prepared.error === "INVALID_TIME_FORMAT") {
        Alert.alert("Hora inválida", "Introduce las horas en formato HH:mm");
        return;
      }

      if (prepared.error === "END_BEFORE_START") {
        Alert.alert(
          "Horas incorrectas",
          "La hora de fin no puede ser anterior a la de inicio.",
        );
        return;
      }

      if (
        prepared.error === "INVALID_CARD_AMOUNT_FORMAT" ||
        prepared.error === "INVALID_CASH_AMOUNT_FORMAT"
      ) {
        Alert.alert("Importe inválido", "Importe cobrado no válido.");
        return;
      }

      if (prepared.error === "CHARGED_AMOUNT_TOO_LOW") {
        Alert.alert(
          "Importe incorrecto",
          "El importe cobrado no puede ser menor que el importe del viaje.",
        );
        return;
      }

      return;
    }

    await UpdateTrip.updateEditedTrip({
      id: trip.id,
      amount: prepared.value.amount,
      payment,
      source,
      startTime: prepared.value.newStartTime,
      endTime: prepared.value.newEndTime,
      manualPickupZone,
      manualDropoffZone,
      chargedAmount: prepared.value.chargedAmountValue,
      cashTip: prepared.value.cashTipValue,
    });

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
            await DeleteTrip.execute(trip.id);
            router.back();
          },
        },
      ],
    );
  };
 /**
 * Devuelve el nombre del barrio efectivo para UI:
 * - Manual si existe
 * - Si no, GEO automático
 */
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
      

      <Pressable
  onPress={() => router.back()}
  style={{ marginBottom: 10 }}
>
  <Text style={{ color: "#0066cc", fontWeight: "600" }}>
    ← Volver
  </Text>
</Pressable>

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

      {/* ---------------------------
    ZONAS DEL VIAJE (MANUAL)
---------------------------- */}
      {/* ---------------------------
    ZONAS DEL VIAJE (MANUAL)
---------------------------- */}
      <Text style={{ marginTop: 10, fontWeight: "600" }}>Zona de recogida</Text>

      <Text>Actual:{" "} {resolveEffectiveNeighborhoodName(manualPickupZone, geoPickupZone)}</Text>

      <Pressable onPress={() => setShowPickupSelector(true)}>
        <Text style={{ color: "#0066cc", fontWeight: "600" }}>
          Cambiar zona
        </Text>
      </Pressable>

      <Text style={{ marginTop: 14, fontWeight: "600" }}>Zona de destino</Text>

      <Text>Actual:{" "} {resolveEffectiveNeighborhoodName(manualDropoffZone, geoDropoffZone)}</Text>

      <Pressable onPress={() => setShowDropoffSelector(true)}>
        <Text style={{ color: "#0066cc", fontWeight: "600" }}>
          Cambiar zona
        </Text>
      </Pressable>

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
      {/* Selector zona recogida */}
      <NeighborhoodSelector
        visible={showPickupSelector}
        title="Seleccionar zona de recogida"
        onSelect={(id) => setManualPickupZone(id)}
        onClose={() => setShowPickupSelector(false)}
      />

      {/* Selector zona destino */}
      <NeighborhoodSelector
        visible={showDropoffSelector}
        title="Seleccionar zona de destino"
        onSelect={(id) => setManualDropoffZone(id)}
        onClose={() => setShowDropoffSelector(false)}
      />
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

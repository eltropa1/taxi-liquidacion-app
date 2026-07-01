import { router, useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoalService } from "../../src/application/runtime";
import {
  formatGoalValue,
  parseGoalValue,
} from "../../src/presentation";


/**
 * Pantalla para editar metas económicas.
 * MVP: simple, directa y funcional.
 */
export default function GoalsScreen() {
  // ---------------------------
  // ESTADO
  // ---------------------------

  const [daily, setDaily] = useState("");
  const [weekly, setWeekly] = useState("");
  const [monthly, setMonthly] = useState("");

  const [loading, setLoading] = useState(true);

  // ---------------------------
  // CARGA INICIAL
  // ---------------------------

  useEffect(() => {
    GoalService.getGoals().then((g) => {
      setDaily(formatGoalValue(g.daily));
      setWeekly(formatGoalValue(g.weekly));
      setMonthly(formatGoalValue(g.monthly));
      setLoading(false);
    });
  }, []);

  // ---------------------------
  // GUARDAR
  // ---------------------------

  const handleSave = async () => {
    await GoalService.saveGoals({
      daily: parseGoalValue(daily),
      weekly: parseGoalValue(weekly),
      monthly: parseGoalValue(monthly),
    });

    alert("Metas guardadas correctamente");
  };

  if (loading) return null;

  // ---------------------------
  // RENDER
  // ---------------------------

  return (
    <SafeAreaView style={styles.container}>
      {/* BOTÓN VOLVER */}
      <View style={{ marginBottom: 10 }}>
        <Button title="← Volver" onPress={() => router.back()} />
      </View>

      <Text style={styles.title}>Metas económicas</Text>

      <Text style={styles.label}>Meta diaria (€)</Text>
      <TextInput
        value={daily}
        onChangeText={setDaily}
        keyboardType="decimal-pad"
        placeholder="Ej: 150"
        style={styles.input}
      />

      <Text style={styles.label}>Meta semanal (€)</Text>
      <TextInput
        value={weekly}
        onChangeText={setWeekly}
        keyboardType="decimal-pad"
        placeholder="Ej: 900"
        style={styles.input}
      />

      <Text style={styles.label}>Meta mensual (€)</Text>
      <TextInput
        value={monthly}
        onChangeText={setMonthly}
        keyboardType="decimal-pad"
        placeholder="Ej: 3800"
        style={styles.input}
      />

      <Button title="Guardar metas" onPress={handleSave} />
    </SafeAreaView>
  );
}

// ---------------------------
// ESTILOS
// ---------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
});

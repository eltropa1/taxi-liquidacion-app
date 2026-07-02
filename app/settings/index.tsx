import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  WEEK_START_DAY_ORDER,
  type WeekStartDay as WeekStartDayType,
} from "../../src/domain/date-time";
import { WeekConfigurationService } from "../../src/application/runtime";

const WEEK_START_DAY_LABELS: Record<WeekStartDayType, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function SettingsScreen() {
  const [weekStartDay, setWeekStartDay] = useState<WeekStartDayType>("monday");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    WeekConfigurationService.getWeekConfiguration()
      .then((configuration) => {
        setWeekStartDay(configuration.weekStartDay);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await WeekConfigurationService.saveWeekConfiguration({ weekStartDay });
      alert("Configuración de semana guardada correctamente");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginBottom: 10 }}>
        <Button title="← Volver" onPress={() => router.back()} />
      </View>

      <Text style={styles.title}>Configuración de semana</Text>
      <Text style={styles.description}>
        El resumen semanal se calculará desde el día seleccionado hasta seis
        días después.
      </Text>

      <View style={styles.options}>
        {WEEK_START_DAY_ORDER.map((day) => (
          <Pressable
            key={day}
            onPress={() => setWeekStartDay(day)}
            style={[styles.chip, weekStartDay === day && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                weekStartDay === day && styles.chipTextActive,
              ]}
            >
              {WEEK_START_DAY_LABELS[day]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.current}>
        Semana operativa actual: {WEEK_START_DAY_LABELS[weekStartDay]}
      </Text>

      <Button
        title={saving ? "Guardando..." : "Guardar configuración"}
        onPress={handleSave}
        disabled={saving}
      />
    </SafeAreaView>
  );
}

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
    marginBottom: 12,
  },
  description: {
    color: "#444",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#cfd8e3",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: "#1f6feb",
    borderColor: "#1f6feb",
  },
  chipText: {
    color: "#1b1f24",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },
  current: {
    textAlign: "center",
    marginBottom: 18,
    fontWeight: "600",
  },
});

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import {
  ExportService,
  HistoricalImportService,
  WeekConfigurationService,
} from "../../src/application/runtime";
import { UpdateWorkday } from "../../src/application/workdays/UpdateWorkday";
import type { WeekStartDay } from "../../src/domain/date-time";
import { useTodayScreen } from "../../src/hooks/useTodayScreen";
import {
  parsePositiveIntegerInput,
  validateWorkdayOdometers,
} from "../../src/domain/workdays/workdayOdometer";
import type { ThemeColors, RadiiTokens, ShadowCardTokens } from "../../src/presentation/theme/tokens";
import { useAppTheme, type ThemePreference } from "../../src/presentation/theme/ThemeProvider";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "auto", label: "Automático" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

export default function MoreScreen() {
  const { colors: themeColors, radii: themeRadii, shadowCard, preference, setPreference } = useAppTheme();
  const styles = useMemo(
    () => createStyles(themeColors, themeRadii, shadowCard),
    [themeColors, themeRadii, shadowCard],
  );
  const [todayDate] = useState(() => new Date());
  const [weekStartDay, setWeekStartDay] = useState<WeekStartDay>("monday");
  const [editingOdometersVisible, setEditingOdometersVisible] = useState(false);
  const [workdayStartOdometerInput, setWorkdayStartOdometerInput] = useState("");
  const [workdayEndOdometerInput, setWorkdayEndOdometerInput] = useState("");
  const [isImportingHistoricalCsv, setIsImportingHistoricalCsv] = useState(false);

  const { workdayInfo, refreshData } = useTodayScreen(todayDate);

  const weekdays = useMemo(
    () => [
      { value: "monday" as const, label: "L" },
      { value: "tuesday" as const, label: "M" },
      { value: "wednesday" as const, label: "X" },
      { value: "thursday" as const, label: "J" },
      { value: "friday" as const, label: "V" },
      { value: "saturday" as const, label: "S" },
      { value: "sunday" as const, label: "D" },
    ],
    [],
  );

  useEffect(() => {
    WeekConfigurationService.getWeekConfiguration()
      .then((configuration) => setWeekStartDay(configuration.weekStartDay))
      .catch(console.error);
  }, []);

  const openEditOdometersModal = () => {
    if (!workdayInfo) {
      Alert.alert(
        "Sin jornada disponible",
        "No hay una jornada abierta o reciente para editar odómetros.",
      );
      return;
    }

    setWorkdayStartOdometerInput(
      workdayInfo.startOdometer !== null && workdayInfo.startOdometer !== undefined
        ? String(workdayInfo.startOdometer)
        : "",
    );
    setWorkdayEndOdometerInput(
      workdayInfo.endOdometer !== null && workdayInfo.endOdometer !== undefined
        ? String(workdayInfo.endOdometer)
        : "",
    );
    setEditingOdometersVisible(true);
  };

  const closeEditOdometersModal = () => {
    setEditingOdometersVisible(false);
    setWorkdayStartOdometerInput("");
    setWorkdayEndOdometerInput("");
  };

  const handleSaveWeekConfiguration = async () => {
    await WeekConfigurationService.saveWeekConfiguration({ weekStartDay });
    alert("Configuración de semana guardada correctamente");
  };

  const handleImportHistoricalCsv = async () => {
    if (isImportingHistoricalCsv) {
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/plain", "application/csv"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Importación cancelada", "No se pudo leer el archivo seleccionado.");
        return;
      }

      setIsImportingHistoricalCsv(true);
      const csv = await FileSystem.readAsStringAsync(asset.uri);
      const importResult = await HistoricalImportService.importHistoricalDatasetFromCsv(csv);

      Alert.alert(
        "Historial recuperado",
        `Se han importado ${importResult.tripCount} servicios y ${importResult.workdayCount} jornadas.`,
      );
      await refreshData();
    } catch (error) {
      Alert.alert(
        "No se pudo importar",
        error instanceof Error ? error.message : "Revisa el archivo CSV histórico e inténtalo de nuevo.",
      );
    } finally {
      setIsImportingHistoricalCsv(false);
    }
  };

  const handleSaveOdometers = async () => {
    if (!workdayInfo) {
      Alert.alert(
        "Sin jornada disponible",
        "No hay una jornada disponible para actualizar odómetros.",
      );
      return;
    }

    const startOdometer = parsePositiveIntegerInput(workdayStartOdometerInput);
    const trimmedEndOdometer = workdayEndOdometerInput.trim();
    const endOdometer =
      trimmedEndOdometer === ""
        ? null
        : parsePositiveIntegerInput(trimmedEndOdometer);

    const validation = validateWorkdayOdometers(startOdometer, endOdometer);

    if (!validation.ok) {
      if (validation.error === "START_ODOMETER_REQUIRED") {
        Alert.alert(
          "Odómetro inicial obligatorio",
          "Introduce un odómetro inicial entero y positivo.",
        );
        return;
      }

      if (
        validation.error === "START_ODOMETER_INVALID" ||
        validation.error === "END_ODOMETER_INVALID"
      ) {
        Alert.alert(
          "Odómetro inválido",
          "Los odómetros deben ser enteros y positivos.",
        );
        return;
      }

      Alert.alert(
        "Odómetros incoherentes",
        "El odómetro final no puede ser menor que el inicial.",
      );
      return;
    }

    if (startOdometer === null) {
      return;
    }

    await UpdateWorkday.execute({
      id: workdayInfo.id,
      startOdometer,
      endOdometer,
    });
    closeEditOdometersModal();
    await refreshData();
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Ajustes</Text>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones disponibles</Text>

          <Pressable
            onPress={() => ExportService.exportTripsToCSV()}
            style={({ pressed }) => [
              styles.actionRow,
              pressed && styles.actionRowPressed,
            ]}
          >
            <Text style={styles.actionLabel}>Exportar CSV global</Text>
            <Text style={styles.actionChevron}>›</Text>
          </Pressable>

          <Pressable
            onPress={handleImportHistoricalCsv}
            style={({ pressed }) => [
              styles.actionRow,
              pressed && styles.actionRowPressed,
            ]}
          >
            <Text style={styles.actionLabel}>
              {isImportingHistoricalCsv
                ? "Importando CSV histórico..."
                : "Importar CSV histórico"}
            </Text>
            {isImportingHistoricalCsv ? (
              <ActivityIndicator color={themeColors.textSecondary} />
            ) : (
              <Text style={styles.actionChevron}>›</Text>
            )}
          </Pressable>

          <Pressable
            onPress={openEditOdometersModal}
            style={({ pressed }) => [
              styles.actionRow,
              pressed && styles.actionRowPressed,
            ]}
          >
            <Text style={styles.actionLabel}>Editar odómetros</Text>
            <Text style={styles.actionChevron}>›</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <Text style={styles.sectionSubtitle}>
            Automático oscurece la pantalla por la noche (21:00–07:00) para no deslumbrar.
          </Text>

          <View style={styles.themeOptionRow}>
            {THEME_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setPreference(option.value)}
                style={[
                  styles.themeOption,
                  preference === option.value && styles.themeOptionActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Tema ${option.label}`}
                accessibilityState={{ selected: preference === option.value }}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    preference === option.value && styles.themeOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <Text style={styles.sectionSubtitle}>Configuración de semana</Text>

          <View style={styles.weekdayRow}>
            {weekdays.map((day) => (
              <Pressable
                key={day.value}
                onPress={() => setWeekStartDay(day.value)}
                style={({ pressed }) => [
                  styles.weekdayChip,
                  weekStartDay === day.value && styles.weekdayChipActive,
                  pressed && styles.weekdayChipPressed,
                ]}
              >
                <Text
                  style={[
                    styles.weekdayChipText,
                    weekStartDay === day.value && styles.weekdayChipTextActive,
                  ]}
                >
                  {day.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleSaveWeekConfiguration}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
          >
            <Text style={styles.saveButtonText}>Guardar configuración</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={editingOdometersVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar odómetros</Text>

            <Text style={styles.fieldLabel}>Odómetro inicial</Text>
            <TextInput
              value={workdayStartOdometerInput}
              onChangeText={setWorkdayStartOdometerInput}
              keyboardType="number-pad"
              placeholder="123456"
              style={styles.input}
            />

            <Text style={[styles.fieldLabel, styles.fieldLabelSpacing]}>
              Odómetro final
            </Text>
            <TextInput
              value={workdayEndOdometerInput}
              onChangeText={setWorkdayEndOdometerInput}
              keyboardType="number-pad"
              placeholder="123789"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={closeEditOdometersModal} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveOdometers}
                style={styles.modalButtonPrimary}
              >
                <Text style={styles.modalButtonPrimaryText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(themeColors: ThemeColors, themeRadii: RadiiTokens, shadowCard: ShadowCardTokens) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: themeColors.bg,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: themeColors.textPrimary,
    marginBottom: 20,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  section: {
    backgroundColor: themeColors.surface,
    borderRadius: themeRadii.card,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
    ...shadowCard,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: themeColors.textPrimary,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: themeColors.textSecondary,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: themeRadii.card,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  actionRowPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: themeColors.textPrimary,
  },
  actionChevron: {
    fontSize: 24,
    color: themeColors.textSecondary,
    lineHeight: 24,
  },
  weekdayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  weekdayChip: {
    minWidth: 44,
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: themeRadii.card,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayChipActive: {
    backgroundColor: themeColors.primarySubtle,
    borderColor: themeColors.primary,
  },
  weekdayChipPressed: {
    opacity: 0.88,
  },
  weekdayChipText: {
    fontSize: 15,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  weekdayChipTextActive: {
    color: themeColors.primary,
  },
  saveButton: {
    marginTop: 4,
    backgroundColor: themeColors.textPrimary,
    borderRadius: themeRadii.button,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    color: themeColors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: themeColors.surface,
    borderTopLeftRadius: themeRadii.card,
    borderTopRightRadius: themeRadii.card,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: themeColors.textPrimary,
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: themeColors.textSecondary,
    marginBottom: 8,
  },
  fieldLabelSpacing: {
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: themeRadii.button,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: themeColors.textPrimary,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: themeRadii.button,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: themeColors.bg,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  modalButtonText: {
    color: themeColors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: themeRadii.button,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: themeColors.textPrimary,
  },
  modalButtonPrimaryText: {
    color: themeColors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  themeOptionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  themeOption: {
    flex: 1,
    minHeight: 44,
    borderRadius: themeRadii.button,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  themeOptionActive: {
    backgroundColor: themeColors.primarySubtle,
    borderColor: themeColors.primary,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: themeColors.textSecondary,
  },
  themeOptionTextActive: {
    color: themeColors.primary,
  },
  });
}

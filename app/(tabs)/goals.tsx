import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { parseGoalValue } from "../../src/presentation";
import {
  formatGoalFieldValue,
  formatGoalPolicyDate,
  formatGoalPolicySummary,
  formatGoalMoney,
  sortGoalPoliciesDescending,
} from "../../src/presentation/goals/GoalsScreenProjection";
import type { GoalPolicy } from "../../src/application/ports/runtime";
import { useGoalsScreen } from "../../src/hooks/useGoalsScreen";

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "0 €";
  }

  return formatGoalMoney(value);
}

function GoalValueBlock({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.goalBlock}>
      <Text style={styles.goalBlockLabel}>{label}</Text>
      <Text style={styles.goalBlockValue}>{formatCurrency(value)}</Text>
    </View>
  );
}

function HistoryCard({
  policy,
  isCurrent,
}: {
  policy: GoalPolicy;
  isCurrent: boolean;
}) {
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyCardTopRow}>
        <Text style={styles.historyDate}>{formatGoalPolicyDate(policy.effectiveAt)}</Text>
        {isCurrent ? <Text style={styles.historyBadge}>Actual</Text> : null}
      </View>
      <Text style={styles.historySummary}>{formatGoalPolicySummary(policy.goals)}</Text>
      <Text style={styles.historyDetail}>
        {isCurrent ? "Vigente ahora mismo." : "Política anterior solo lectura."}
      </Text>
    </View>
  );
}

export default function GoalsScreen() {
  const { currentPolicy, goalHistory, isLoading, saveGoals } = useGoalsScreen();
  const [editorVisible, setEditorVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [dailyDraft, setDailyDraft] = useState("");
  const [weeklyDraft, setWeeklyDraft] = useState("");
  const [monthlyDraft, setMonthlyDraft] = useState("");

  const orderedHistory = useMemo(
    () => sortGoalPoliciesDescending(goalHistory),
    [goalHistory],
  );

  const activeGoals = currentPolicy?.goals ?? {
    daily: 0,
    weekly: 0,
    monthly: 0,
  };

  const activePolicyLabel = currentPolicy
    ? `Vigentes desde ${formatGoalPolicyDate(currentPolicy.effectiveAt)}`
    : "Sin política vigente todavía";

  const openEditor = () => {
    setDailyDraft(formatGoalFieldValue(activeGoals.daily));
    setWeeklyDraft(formatGoalFieldValue(activeGoals.weekly));
    setMonthlyDraft(formatGoalFieldValue(activeGoals.monthly));
    setEditorVisible(true);
  };

  const handleSave = async () => {
    await saveGoals({
      daily: parseGoalValue(dailyDraft),
      weekly: parseGoalValue(weeklyDraft),
      monthly: parseGoalValue(monthlyDraft),
    });

    setEditorVisible(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Metas</Text>
          <Text style={styles.title}>Define tus objetivos de trabajo</Text>
          <Text style={styles.subtitle}>
            Configura tus metas diarias, semanales y mensuales desde un único sitio.
          </Text>
        </View>

        <View style={styles.currentCard}>
          <View style={styles.currentHeader}>
            <View style={styles.currentHeaderText}>
              <Text style={styles.currentLabel}>Política actual</Text>
              <Text style={styles.currentVigency}>{activePolicyLabel}</Text>
            </View>
            <Text style={styles.currentBadge}>{currentPolicy ? "Activa" : "Vacía"}</Text>
          </View>

          <View style={styles.goalsGrid}>
            <GoalValueBlock label="Meta diaria" value={activeGoals.daily} />
            <GoalValueBlock label="Meta semanal" value={activeGoals.weekly} />
            <GoalValueBlock label="Meta mensual" value={activeGoals.monthly} />
          </View>

          <Text style={styles.helper}>
            Cada meta es independiente. Cambiar una no modifica las demás.
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={openEditor}
            style={({ pressed }) => [
              styles.primaryAction,
              pressed && styles.primaryActionPressed,
            ]}
          >
            <Text style={styles.primaryActionText}>Editar metas</Text>
          </Pressable>

          <Pressable
            onPress={() => setHistoryVisible(true)}
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.secondaryActionPressed,
            ]}
          >
            <Text style={styles.secondaryActionText}>Historial de cambios</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Alcance</Text>
          <Text style={styles.infoText}>
            No hay metas quincenales ni anuales. La semana parcial se mantiene
            independiente y no altera la meta semanal configurada.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={editorVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar metas</Text>
            <Text style={styles.modalSubtitle}>
              Cada meta es independiente. Cambiar una no modifica las demás.
            </Text>

            <Text style={styles.fieldLabel}>Meta diaria</Text>
            <TextInput
              value={dailyDraft}
              onChangeText={setDailyDraft}
              keyboardType="decimal-pad"
              placeholder="150"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Meta semanal</Text>
            <TextInput
              value={weeklyDraft}
              onChangeText={setWeeklyDraft}
              keyboardType="decimal-pad"
              placeholder="1000"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Meta mensual</Text>
            <TextInput
              value={monthlyDraft}
              onChangeText={setMonthlyDraft}
              keyboardType="decimal-pad"
              placeholder="4000"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setEditorVisible(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && styles.modalButtonPressed,
                ]}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                disabled={isLoading}
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.modalButtonPrimary,
                  pressed && !isLoading && styles.modalButtonPrimaryPressed,
                  isLoading && styles.modalButtonDisabled,
                ]}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {isLoading ? "Guardando…" : "Guardar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={historyVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopRow}>
              <View style={styles.modalTopText}>
                <Text style={styles.modalTitle}>Historial de cambios</Text>
                <Text style={styles.modalSubtitle}>
                  Versiones guardadas de más reciente a más antigua.
                </Text>
              </View>
              <Pressable onPress={() => setHistoryVisible(false)} style={styles.closeChip}>
                <Text style={styles.closeChipText}>Cerrar</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.historyScroll}
              contentContainerStyle={styles.historyList}
              showsVerticalScrollIndicator={false}
            >
              {orderedHistory.length > 0 ? (
                orderedHistory.map((policy, index) => (
                  <HistoryCard
                    key={policy.id}
                    policy={policy}
                    isCurrent={index === 0}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>Sin cambios guardados</Text>
                  <Text style={styles.emptyStateText}>
                    Cuando guardes una nueva versión aparecerá aquí.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f1eb",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 14,
  },
  hero: {
    gap: 6,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#6e6457",
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: "#1f1a17",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6e6457",
    fontWeight: "500",
  },
  currentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ece3d6",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    gap: 14,
  },
  currentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  currentHeaderText: {
    flex: 1,
    gap: 4,
  },
  currentLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1f1a17",
  },
  currentVigency: {
    fontSize: 13,
    color: "#6e6457",
    fontWeight: "600",
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#dff4ef",
    color: "#0f766e",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  goalsGrid: {
    gap: 10,
  },
  goalBlock: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#f7f3ec",
    borderWidth: 1,
    borderColor: "#e8ddd0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalBlockLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4d463f",
  },
  goalBlockValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1f1a17",
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6e6457",
  },
  actionsRow: {
    gap: 10,
  },
  primaryAction: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#1c7c43",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    shadowColor: "#1c7c43",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryActionPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ffffff",
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#efe8dc",
    borderWidth: 1,
    borderColor: "#d9cbb8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryActionPressed: {
    opacity: 0.88,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1f1a17",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ece3d6",
    gap: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1f1a17",
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6e6457",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: "#ece3d6",
  },
  modalTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  modalTopText: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1f1a17",
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: "#6e6457",
    fontWeight: "500",
  },
  closeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#efe8dc",
  },
  closeChipText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#1f1a17",
    textTransform: "uppercase",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4d463f",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8d0c5",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f1a17",
    backgroundColor: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#efe8dc",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPressed: {
    opacity: 0.88,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1f1a17",
  },
  modalButtonPrimary: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#1c7c43",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPrimaryPressed: {
    opacity: 0.92,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fff",
  },
  historyScroll: {
    marginTop: 8,
  },
  historyList: {
    gap: 10,
    paddingBottom: 8,
  },
  historyCard: {
    backgroundColor: "#f7f3ec",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e8ddd0",
    gap: 6,
  },
  historyCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  historyDate: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: "#1f1a17",
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#dff4ef",
    color: "#0f766e",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  historySummary: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
    color: "#1f1a17",
  },
  historyDetail: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6e6457",
  },
  emptyState: {
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1f1a17",
  },
  emptyStateText: {
    fontSize: 12,
    color: "#6e6457",
    textAlign: "center",
    lineHeight: 18,
  },
});

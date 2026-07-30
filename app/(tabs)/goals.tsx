import { useMemo, useState } from "react";
import {
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
import type {
  ThemeColors,
  RadiiTokens,
  ShadowCardTokens,
} from "../../src/presentation/theme/tokens";
import { useAppTheme } from "../../src/presentation/theme/ThemeProvider";

type GoalsStyles = ReturnType<typeof createStyles>;

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "0 €";
  }

  return formatGoalMoney(value);
}

function GoalValueBlock({
  label,
  value,
  styles,
}: {
  label: string;
  value: number;
  styles: GoalsStyles;
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
  styles,
}: {
  policy: GoalPolicy;
  isCurrent: boolean;
  styles: GoalsStyles;
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
  const { colors: themeColors, radii: themeRadii, shadowCard } = useAppTheme();
  const styles = useMemo(
    () => createStyles(themeColors, themeRadii, shadowCard),
    [themeColors, themeRadii, shadowCard],
  );
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

  const handleSave = () => {
    const goalsInput = {
      daily: parseGoalValue(dailyDraft),
      weekly: parseGoalValue(weeklyDraft),
      monthly: parseGoalValue(monthlyDraft),
    };

    // Camino de respuesta instantánea: cerramos el editor al toque y el guardado
    // en almacenamiento continúa en segundo plano.
    setEditorVisible(false);

    saveGoals(goalsInput).catch((error) => {
      console.error("Error guardando metas", error);
      Alert.alert(
        "No se han podido guardar las metas",
        "Revisa los valores e inténtalo de nuevo.",
      );
    });
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
            <GoalValueBlock label="Meta diaria" value={activeGoals.daily} styles={styles} />
            <GoalValueBlock label="Meta semanal" value={activeGoals.weekly} styles={styles} />
            <GoalValueBlock label="Meta mensual" value={activeGoals.monthly} styles={styles} />
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
                    styles={styles}
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

function createStyles(themeColors: ThemeColors, themeRadii: RadiiTokens, shadowCard: ShadowCardTokens) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: themeColors.bg,
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
    color: themeColors.textSecondary,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: themeColors.textSecondary,
    fontWeight: "500",
  },
  currentCard: {
    backgroundColor: themeColors.surface,
    borderRadius: themeRadii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
    ...shadowCard,
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
    fontWeight: "600",
    color: themeColors.textPrimary,
  },
  currentVigency: {
    fontSize: 13,
    color: themeColors.textSecondary,
    fontWeight: "600",
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: themeColors.primarySubtle,
    color: themeColors.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  goalsGrid: {
    gap: 10,
  },
  goalBlock: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: themeRadii.card,
    backgroundColor: themeColors.bg,
    borderWidth: 1,
    borderColor: themeColors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalBlockLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textSecondary,
  },
  goalBlockValue: {
    fontSize: 18,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
    color: themeColors.textSecondary,
  },
  actionsRow: {
    gap: 10,
  },
  primaryAction: {
    minHeight: 52,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    ...shadowCard,
  },
  primaryActionPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: "700",
    color: themeColors.surface,
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.bg,
    borderWidth: 1,
    borderColor: themeColors.border,
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
    color: themeColors.textPrimary,
  },
  infoCard: {
    backgroundColor: themeColors.surface,
    borderRadius: themeRadii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
    gap: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: themeColors.textPrimary,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    color: themeColors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: themeColors.surface,
    borderRadius: themeRadii.card,
    padding: 18,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: themeColors.border,
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
    fontWeight: "600",
    color: themeColors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: themeColors.textSecondary,
    fontWeight: "500",
  },
  closeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: themeColors.bg,
  },
  closeChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: themeColors.textPrimary,
    textTransform: "uppercase",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: themeRadii.button,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: themeColors.textPrimary,
    backgroundColor: themeColors.surface,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.bg,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPressed: {
    opacity: 0.88,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  modalButtonPrimary: {
    flex: 1,
    minHeight: 48,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.primary,
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
    fontWeight: "700",
    color: themeColors.surface,
  },
  historyScroll: {
    marginTop: 8,
  },
  historyList: {
    gap: 10,
    paddingBottom: 8,
  },
  historyCard: {
    backgroundColor: themeColors.bg,
    borderRadius: themeRadii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: themeColors.border,
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
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: themeColors.primarySubtle,
    color: themeColors.primary,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  historySummary: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  historyDetail: {
    fontSize: 12,
    lineHeight: 18,
    color: themeColors.textSecondary,
  },
  emptyState: {
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: themeColors.textPrimary,
  },
  emptyStateText: {
    fontSize: 12,
    color: themeColors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  });
}

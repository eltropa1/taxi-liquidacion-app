import type React from "react";
import { useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { radii as themeRadii } from "../../presentation/theme/tokens";
import { useAppTheme } from "../../presentation/theme/ThemeProvider";

/**
 * Remapeo local hacia la fuente única de tokens
 * (src/presentation/theme/tokens.ts), preservando los nombres que ya
 * consume este archivo. Reactivo al esquema claro/oscuro activo.
 */
function useDetailColors() {
  const { colors: themeColors } = useAppTheme();
  return useMemo(
    () => ({
      background: themeColors.bg,
      surface: themeColors.surface,
      surfaceMuted: themeColors.border,
      ink: themeColors.textPrimary,
      text: themeColors.textPrimary,
      muted: themeColors.textSecondary,
      faint: themeColors.textSecondary,
      border: themeColors.border,
      primary: themeColors.primary,
      primarySurface: themeColors.primarySubtle,
      danger: themeColors.danger,
      dangerSurface: themeColors.dangerSubtle,
      warning: themeColors.warning,
      warningSurface: themeColors.warningSubtle,
    }),
    [themeColors],
  );
}

type DetailColors = ReturnType<typeof useDetailColors>;

/** Hook público: da acceso a la paleta y a los estilos del detalle de servicio. */
export function useDetailTheme() {
  const colors = useDetailColors();
  const styles = useMemo(() => buildDetailStyles(colors), [colors]);
  return { colors, styles };
}

export type DetailActionState = Readonly<{
  saving: boolean;
  disabled?: boolean;
}>;

export function RegisteredServiceDetailHeader({
  title,
  status,
  schedule,
  mode,
  onBack,
  onHome,
  onCorrect,
}: {
  title: string;
  status: string;
  schedule: string;
  mode: "view" | "correction";
  onBack: () => void;
  onHome: () => void;
  onCorrect: () => void;
}) {
  const { colors, styles: detailStyles } = useDetailTheme();
  return (
    <View style={detailStyles.header}>
      <View style={detailStyles.headerTopRow}>
        <Pressable
          onPress={onBack}
          style={detailStyles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={detailStyles.headerText}>
          <Text style={detailStyles.title}>{title}</Text>
          <Text style={detailStyles.headerSubtitle}>{schedule}</Text>
        </View>
        <Pressable
          onPress={onHome}
          style={detailStyles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Inicio"
        >
          <MaterialIcons name="home" size={22} color={colors.text} />
        </Pressable>
        {mode === "view" ? (
          <Pressable
            onPress={onCorrect}
            style={detailStyles.correctButton}
            accessibilityRole="button"
            accessibilityLabel="Corregir servicio"
          >
            <MaterialIcons name="edit" size={17} color={colors.primary} />
            <Text style={detailStyles.correctButtonText}>Corregir</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={detailStyles.statusRow}>
        <Text style={detailStyles.statusPill}>{status}</Text>
        {mode === "correction" ? (
          <Text style={detailStyles.correctionPill}>Corrigiendo</Text>
        ) : null}
      </View>
    </View>
  );
}

export function ServiceEconomicSummary({
  amount,
  payment,
  source,
  chargedAmount,
  cashTotal,
  cashTip,
}: {
  amount: string;
  payment: string;
  source: string;
  chargedAmount: string | null;
  cashTotal: string | null;
  cashTip: string | null;
}) {
  const { colors, styles: detailStyles } = useDetailTheme();
  const secondaryItems = [
    { label: "Pago", value: payment, icon: "payments" as const },
    { label: "Plataforma", value: source, icon: "local-taxi" as const },
  ];

  const moneyItems = [
    chargedAmount
      ? { label: "Cobrado tarjeta", value: chargedAmount }
      : null,
    cashTotal ? { label: "Total efectivo", value: cashTotal } : null,
    cashTip ? { label: "Propina", value: cashTip } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <View style={detailStyles.summary}>
      <Text style={detailStyles.summaryEyebrow}>Resultado economico</Text>
      <Text
        style={detailStyles.amount}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
      >
        {amount}
      </Text>
      <View style={detailStyles.summaryPills}>
        {secondaryItems.map((item) => (
          <View key={item.label} style={detailStyles.summaryPill}>
            <MaterialIcons name={item.icon} size={16} color={colors.primary} />
            <View style={detailStyles.summaryPillText}>
              <Text style={detailStyles.summaryPillLabel}>{item.label}</Text>
              <Text style={detailStyles.summaryPillValue} numberOfLines={1}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
      {moneyItems.length > 0 ? (
        <View style={detailStyles.summaryMoneyGrid}>
          {moneyItems.map((item) => (
            <View key={item.label} style={detailStyles.summaryMoneyItem}>
              <Text style={detailStyles.readLabel}>{item.label}</Text>
              <Text style={detailStyles.readValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  children: React.ReactNode;
}) {
  const { colors, styles: detailStyles } = useDetailTheme();
  return (
    <View style={detailStyles.section}>
      <View style={detailStyles.sectionHeader}>
        <MaterialIcons name={icon} size={18} color={colors.primary} />
        <Text style={detailStyles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function ReadRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  const { styles: detailStyles } = useDetailTheme();
  return (
    <View style={detailStyles.readRow}>
      <Text style={detailStyles.readLabel}>{label}</Text>
      <Text
        style={[detailStyles.readValue, emphasis && detailStyles.readValueStrong]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export function Field({
  label,
  error,
  helper,
  children,
}: {
  label: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  const { colors, styles: detailStyles } = useDetailTheme();
  return (
    <View style={detailStyles.field}>
      <Text style={detailStyles.inputLabel}>{label}</Text>
      {children}
      {helper ? <Text style={detailStyles.helper}>{helper}</Text> : null}
      {error ? (
        <View style={detailStyles.errorRow}>
          <MaterialIcons name="error-outline" size={15} color={colors.danger} />
          <Text style={detailStyles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function DetailTextInput(props: TextInputProps) {
  const { colors, styles: detailStyles } = useDetailTheme();
  return (
    <TextInput
      {...props}
      style={[detailStyles.input, props.style]}
      placeholderTextColor={colors.faint}
    />
  );
}

export function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const { styles: detailStyles } = useDetailTheme();
  return (
    <View style={detailStyles.segmentedControl}>
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              detailStyles.segment,
              active && detailStyles.segmentActive,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                detailStyles.segmentText,
                active && detailStyles.segmentTextActive,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ZoneCorrectionRow({
  label,
  value,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  onChange: () => void;
  onClear: () => void;
}) {
  const { styles: detailStyles } = useDetailTheme();
  return (
    <View style={detailStyles.zoneRow}>
      <View style={detailStyles.zoneText}>
        <Text style={detailStyles.readLabel}>{label}</Text>
        <Text style={detailStyles.zoneValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
      <View style={detailStyles.zoneActions}>
        <Pressable
          onPress={onChange}
          style={detailStyles.textAction}
          accessibilityRole="button"
          accessibilityLabel={`Cambiar ${label}`}
        >
          <Text style={detailStyles.textActionLabel}>Cambiar</Text>
        </Pressable>
        <Pressable
          onPress={onClear}
          style={detailStyles.textAction}
          accessibilityRole="button"
          accessibilityLabel={`Limpiar ${label}`}
        >
          <Text style={detailStyles.textActionLabel}>Limpiar</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function CorrectionActionBar({
  saving,
  onCancel,
  onSave,
}: {
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { styles: detailStyles } = useDetailTheme();
  return (
    <View style={detailStyles.actionBar}>
      <Pressable
        onPress={onCancel}
        disabled={saving}
        style={[detailStyles.secondaryButton, saving && detailStyles.disabled]}
        accessibilityRole="button"
        accessibilityLabel="Cancelar correccion"
      >
        <Text style={detailStyles.secondaryButtonText}>Cancelar</Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        disabled={saving}
        style={[detailStyles.primaryButton, saving && detailStyles.disabled]}
        accessibilityRole="button"
        accessibilityLabel="Guardar correcciones"
      >
        <Text style={detailStyles.primaryButtonText}>
          {saving ? "Guardando..." : "Guardar correcciones"}
        </Text>
      </Pressable>
    </View>
  );
}

export function DestructiveRecordSection({
  deleting,
  onDelete,
}: {
  deleting: boolean;
  onDelete: () => void;
}) {
  const { colors, styles: detailStyles } = useDetailTheme();
  return (
    <View style={detailStyles.dangerZone}>
      <View style={detailStyles.sectionHeader}>
        <MaterialIcons name="block" size={18} color={colors.danger} />
        <Text style={detailStyles.dangerTitle}>Anular</Text>
      </View>
      <Text style={detailStyles.helper}>
        El servicio se marca como anulado y deja de contar en los totales.
        Se conserva junto con sus ubicaciones, nota y adjuntos para consulta.
      </Text>
      <Pressable
        onPress={onDelete}
        disabled={deleting}
        style={[detailStyles.dangerButton, deleting && detailStyles.disabled]}
        accessibilityRole="button"
        accessibilityLabel="Anular servicio"
      >
        <Text style={detailStyles.dangerButtonText}>
          {deleting ? "Anulando..." : "Anular servicio"}
        </Text>
      </Pressable>
    </View>
  );
}

function buildDetailStyles(colors: DetailColors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingTop: 48,
    paddingBottom: 28,
    gap: 14,
  },
  contentWithBar: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  header: {
    gap: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.ink,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "700",
    marginTop: 2,
  },
  correctButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: themeRadii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  correctButtonText: {
    color: colors.primary,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primarySurface,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  correctionPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.warningSurface,
    color: colors.warning,
    fontWeight: "700",
    fontSize: 12,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: themeRadii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  summaryEyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  amount: {
    color: colors.ink,
    fontSize: 36,
    fontWeight: "700",
  },
  summaryPills: {
    flexDirection: "row",
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: themeRadii.button,
    backgroundColor: colors.surfaceMuted,
  },
  summaryPillText: {
    minWidth: 0,
    flex: 1,
  },
  summaryPillLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "800",
  },
  summaryPillValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
  },
  summaryMoneyGrid: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    gap: 8,
  },
  summaryMoneyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: themeRadii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  readRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 2,
  },
  readLabel: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  readValue: {
    flex: 1.25,
    textAlign: "right",
    color: colors.text,
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 18,
  },
  readValueStrong: {
    color: colors.ink,
    fontWeight: "700",
  },
  field: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: themeRadii.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    fontSize: 15,
    color: colors.ink,
  },
  helper: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "800",
    flex: 1,
  },
  segmentedControl: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  segment: {
    minHeight: 44,
    minWidth: 82,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: themeRadii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segmentActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  segmentText: {
    fontWeight: "700",
    color: colors.text,
  },
  segmentTextActive: {
    color: colors.primary,
  },
  zoneRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: themeRadii.button,
    padding: 12,
    gap: 10,
    backgroundColor: colors.surfaceMuted,
  },
  zoneText: {
    gap: 3,
  },
  zoneValue: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  zoneActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  textAction: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: themeRadii.button,
  },
  textActionLabel: {
    color: colors.primary,
    fontWeight: "700",
  },
  actionBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  primaryButton: {
    flex: 1.35,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: themeRadii.button,
    // Guardar correcciones: acción de cierre/corrección administrativa, no de avance de ingresos — neutro, no verde.
    backgroundColor: colors.ink,
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: themeRadii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.55,
  },
  dangerZone: {
    marginTop: 8,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.danger,
  },
  dangerButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: themeRadii.button,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSurface,
  },
  dangerButtonText: {
    color: colors.danger,
    fontWeight: "700",
  },
  });
}

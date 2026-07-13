import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  Alert,
  BackHandler,
  Button,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import { TripService } from "../../src/application/runtime";
import { CorrectRegisteredService } from "../../src/application/trips/CorrectRegisteredService";
import { DeleteRegisteredServiceRecord } from "../../src/application/trips/DeleteRegisteredServiceRecord";
import { PaymentType, TripSource } from "../../src/constants/enums";
import { NeighborhoodSelector } from "../../src/components/forms/NeighborhoodSelector";
import {
  buildRegisteredServiceDetailProjection,
  createRegisteredServiceCorrectionForm,
  prepareRegisteredServiceCorrection,
  resolveEffectiveNeighborhoodName,
  resolveTripEditSnapshotZones,
  type RegisteredServiceCorrectionForm,
  type RegisteredServiceRecord,
} from "../../src/presentation";
import type { TripGeoSnapshotRecord } from "../../src/application/ports/persistence";

type ScreenMode = "view" | "correction";

export default function RegisteredServiceDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mode, setMode] = useState<ScreenMode>("view");
  const [trip, setTrip] = useState<RegisteredServiceRecord | null>(null);
  const [snapshots, setSnapshots] = useState<TripGeoSnapshotRecord[]>([]);
  const [form, setForm] = useState<RegisteredServiceCorrectionForm | null>(null);
  const [showPickupSelector, setShowPickupSelector] = useState(false);
  const [showDropoffSelector, setShowDropoffSelector] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const confirmingDiscardRef = useRef(false);

  const prepared = useMemo(() => {
    if (!trip || !form) return null;
    return prepareRegisteredServiceCorrection(trip, form);
  }, [trip, form]);

  const isDirty = mode === "correction" && prepared?.ok === true && prepared.dirty;

  const projection = useMemo(() => {
    if (!trip) return null;
    return buildRegisteredServiceDetailProjection({ trip, snapshots });
  }, [trip, snapshots]);

  const correctionZones = useMemo(() => {
    const geo = resolveTripEditSnapshotZones(snapshots);
    return {
      pickup: resolveEffectiveNeighborhoodName(
        form?.manualPickupZone ?? null,
        geo.geoPickupZone,
      ),
      dropoff: resolveEffectiveNeighborhoodName(
        form?.manualDropoffZone ?? null,
        geo.geoDropoffZone,
      ),
    };
  }, [form?.manualDropoffZone, form?.manualPickupZone, snapshots]);

  const load = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    const id = Number(tripId);
    const loadedTrip = await TripService.getTripById(id);

    if (!loadedTrip) {
      setLoading(false);
      Alert.alert("Servicio no encontrado", "No se ha encontrado el registro.");
      navigateBack();
      return;
    }

    if (loadedTrip.serviceStatus !== "completed") {
      setLoading(false);
      Alert.alert(
        "Servicio pendiente",
        "Este registro debe completarse desde el flujo de Completar servicio.",
      );
      navigateBack();
      return;
    }

    const loadedSnapshots = await TripService.getTripGeoSnapshots(id);
    setTrip(loadedTrip);
    setSnapshots(loadedSnapshots);
    setForm(createRegisteredServiceCorrectionForm(loadedTrip));
    setMode("view");
    setSaveError(null);
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    load().catch((error) => {
      console.error("Error loading registered service detail", error);
      setLoading(false);
      Alert.alert("Error", "No se ha podido cargar el servicio.");
    });
  }, [load]);

  const requestDiscard = useCallback(
    (onDiscard: () => void) => {
      if (!isDirty) {
        onDiscard();
        return;
      }

      if (confirmingDiscardRef.current) return;
      confirmingDiscardRef.current = true;
      Alert.alert("¿Descartar las correcciones realizadas?", "", [
        {
          text: "Seguir corrigiendo",
          style: "cancel",
          onPress: () => {
            confirmingDiscardRef.current = false;
          },
        },
        {
          text: "Descartar cambios",
          style: "destructive",
          onPress: () => {
            confirmingDiscardRef.current = false;
            onDiscard();
          },
        },
      ]);
    },
    [isDirty],
  );

  useEffect(() => {
    const subscription = navigation.addListener("beforeRemove", (event) => {
      if (!isDirty) return;
      event.preventDefault();
      requestDiscard(() => navigation.dispatch(event.data.action));
    });

    return subscription;
  }, [isDirty, navigation, requestDiscard]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!isDirty) return false;
      requestDiscard(navigateBack);
      return true;
    });

    return () => subscription.remove();
  }, [isDirty, requestDiscard]);

  function updateForm(
    updater: (current: RegisteredServiceCorrectionForm) => RegisteredServiceCorrectionForm,
  ) {
    setForm((current) => (current ? updater(current) : current));
  }

  function startCorrection() {
    if (trip) {
      setForm(createRegisteredServiceCorrectionForm(trip));
    }
    setSaveError(null);
    setMode("correction");
  }

  function cancelCorrection() {
    requestDiscard(() => {
      if (trip) {
        setForm(createRegisteredServiceCorrectionForm(trip));
      }
      setSaveError(null);
      setMode("view");
    });
  }

  async function saveCorrection() {
    if (!trip || !form || saving || !prepared) return;

    if (!prepared.ok) {
      setSaveError("Revisa los campos marcados antes de guardar.");
      return;
    }

    if (!prepared.dirty) {
      setSaveError(null);
      setMode("view");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const result = await CorrectRegisteredService.execute(prepared.command);
      if (result.status === "unchanged") {
        setMode("view");
        return;
      }

      navigateBack();
    } catch (error) {
      console.error("Error saving registered service correction", error);
      setSaveError(
        "No se han podido guardar las correcciones. Los datos se conservan para reintentar.",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!trip || deleting) return;
    Alert.alert(
      "Eliminar registro completo",
      "Se eliminara el servicio registrado, el viaje operativo asociado y los enriquecimientos dependientes. Esta accion no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar registro completo",
          style: "destructive",
          onPress: deleteRecord,
        },
      ],
    );
  }

  async function deleteRecord() {
    if (!trip || deleting) return;
    setDeleting(true);
    try {
      const result = await DeleteRegisteredServiceRecord.execute(trip.id);
      if (result.enrichmentCleanupPending) {
        Alert.alert(
          "Registro eliminado",
          "El registro se elimino. Queda limpieza de adjuntos pendiente de reconciliacion.",
          [{ text: "Aceptar", onPress: navigateBack }],
        );
        return;
      }
      navigateBack();
    } catch (error) {
      console.error("Error deleting registered service", error);
      Alert.alert(
        "No se ha podido eliminar",
        "El registro sigue disponible. Intentalo de nuevo.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !projection || !trip || !form) {
    return (
      <View style={styles.centered}>
        <Text>Cargando detalle del servicio...</Text>
      </View>
    );
  }

  const errors = prepared && !prepared.ok ? prepared.errors : {};

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => requestDiscard(navigateBack)} style={styles.back}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.status}>{projection.statusLabel}</Text>
          <Text style={styles.title}>{projection.title}</Text>
          <Text style={styles.subtitle}>{projection.scheduleLabel}</Text>
        </View>

        {mode === "view" ? (
          <>
            <Section title="Servicio">
              <ReadRow label="Importe" value={projection.amountLabel} />
              <ReadRow label="Metodo de pago" value={projection.paymentLabel} />
              {projection.chargedAmountLabel && (
                <ReadRow
                  label="Importe cobrado por tarjeta"
                  value={projection.chargedAmountLabel}
                />
              )}
              {projection.cashTotalReceivedLabel && (
                <ReadRow
                  label="Total cobrado en efectivo"
                  value={projection.cashTotalReceivedLabel}
                />
              )}
              {projection.cashTipLabel && (
                <ReadRow label="Propina" value={projection.cashTipLabel} />
              )}
              <ReadRow label="Clasificacion" value={projection.sourceLabel} />
              {projection.customSourceLabel && (
                <ReadRow
                  label="Clasificacion personalizada"
                  value={projection.customSourceLabel}
                />
              )}
            </Section>

            <Section title="Viaje">
              <ReadRow label="Hora inicio" value={form.startTimeInput} />
              <ReadRow label="Hora fin" value={form.endTimeInput} />
              <ReadRow
                label="Zona manual de recogida"
                value={projection.manualPickupZoneLabel}
              />
              <ReadRow
                label="Zona manual de destino"
                value={projection.manualDropoffZoneLabel}
              />
            </Section>

            <Section title="Ubicacion detectada">
              <ReadRow label="GEO inicio" value={projection.geoPickupZoneLabel} />
              <ReadRow label="GEO fin" value={projection.geoDropoffZoneLabel} />
              <Text style={styles.helper}>
                Ubicacion automatica solo lectura.
              </Text>
            </Section>

            <View style={styles.actions}>
              <Button title="Corregir" onPress={startCorrection} />
            </View>

            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Zona destructiva</Text>
              <Button
                title={deleting ? "Eliminando..." : "Eliminar registro completo"}
                color="#b42318"
                disabled={deleting}
                onPress={confirmDelete}
              />
            </View>
          </>
        ) : (
          <>
            <Section title="Servicio">
              <Field label="Importe" error={errors.amount}>
                <TextInput
                  value={form.amountInput}
                  onChangeText={(value) =>
                    updateForm((current) => ({ ...current, amountInput: value }))
                  }
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </Field>

              <Text style={styles.label}>Metodo de pago</Text>
              <ChipRow
                values={[PaymentType.CASH, PaymentType.CARD, PaymentType.APP]}
                selected={form.payment}
                onSelect={(payment) =>
                  updateForm((current) => ({
                    ...current,
                    payment,
                    chargedAmountInput:
                      payment === PaymentType.CARD
                        ? current.chargedAmountInput
                        : "",
                    cashTotalReceivedInput:
                      payment === PaymentType.CASH
                        ? current.cashTotalReceivedInput
                        : "",
                  }))
                }
              />
              <Text style={styles.helper}>
                Al cambiar el metodo se normalizan los importes no aplicables.
              </Text>

              {form.payment === PaymentType.CARD && (
                <Field
                  label="Importe cobrado por tarjeta"
                  error={errors.chargedAmount}
                >
                  <TextInput
                    value={form.chargedAmountInput}
                    onChangeText={(value) =>
                      updateForm((current) => ({
                        ...current,
                        chargedAmountInput: value,
                      }))
                    }
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                </Field>
              )}

              {form.payment === PaymentType.CASH && (
                <Field
                  label="Total cobrado en efectivo"
                  error={errors.cashTotalReceived}
                >
                  <TextInput
                    value={form.cashTotalReceivedInput}
                    onChangeText={(value) =>
                      updateForm((current) => ({
                        ...current,
                        cashTotalReceivedInput: value,
                      }))
                    }
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                </Field>
              )}

              <Text style={styles.label}>Clasificacion</Text>
              <ChipRow
                values={[
                  TripSource.TAXI,
                  TripSource.UBER,
                  TripSource.CABIFY,
                  TripSource.FREE_NOW,
                  TripSource.CUSTOM,
                ]}
                selected={form.source}
                onSelect={(source) =>
                  updateForm((current) => ({ ...current, source }))
                }
              />
              {form.source === TripSource.CUSTOM && (
                <Field
                  label="Clasificacion personalizada"
                  error={errors.customSource}
                >
                  <TextInput
                    value={form.customSourceInput}
                    onChangeText={(value) =>
                      updateForm((current) => ({
                        ...current,
                        customSourceInput: value,
                      }))
                    }
                    style={styles.input}
                  />
                </Field>
              )}
            </Section>

            <Section title="Viaje">
              <Field label="Hora inicio" error={errors.startTime}>
                <TextInput
                  value={form.startTimeInput}
                  onChangeText={(value) =>
                    updateForm((current) => ({
                      ...current,
                      startTimeInput: value,
                    }))
                  }
                  placeholder="08:30"
                  style={styles.input}
                />
              </Field>
              <Field label="Hora fin" error={errors.endTime}>
                <TextInput
                  value={form.endTimeInput}
                  onChangeText={(value) =>
                    updateForm((current) => ({ ...current, endTimeInput: value }))
                  }
                  placeholder="09:10"
                  style={styles.input}
                />
              </Field>

              <ZoneEditor
                label="Zona manual de recogida"
                value={correctionZones.pickup}
                onChange={() => setShowPickupSelector(true)}
                onClear={() =>
                  updateForm((current) => ({
                    ...current,
                    manualPickupZone: null,
                  }))
                }
              />
              <ZoneEditor
                label="Zona manual de destino"
                value={correctionZones.dropoff}
                onChange={() => setShowDropoffSelector(true)}
                onClear={() =>
                  updateForm((current) => ({
                    ...current,
                    manualDropoffZone: null,
                  }))
                }
              />
            </Section>

            <Section title="Ubicacion detectada">
              <ReadRow label="GEO inicio" value={projection.geoPickupZoneLabel} />
              <ReadRow label="GEO fin" value={projection.geoDropoffZoneLabel} />
              <Text style={styles.helper}>GEO automatico solo lectura.</Text>
            </Section>

            {saveError && <Text style={styles.error}>{saveError}</Text>}

            <View style={styles.actions}>
              <Button
                title={saving ? "Guardando..." : "Guardar correcciones"}
                disabled={saving}
                onPress={saveCorrection}
              />
              <View style={styles.actionSpacer} />
              <Button title="Cancelar" disabled={saving} onPress={cancelCorrection} />
            </View>
          </>
        )}

        <NeighborhoodSelector
          visible={showPickupSelector}
          title="Seleccionar zona de recogida"
          onSelect={(id) =>
            updateForm((current) => ({ ...current, manualPickupZone: id }))
          }
          onClose={() => setShowPickupSelector(false)}
        />

        <NeighborhoodSelector
          visible={showDropoffSelector}
          title="Seleccionar zona de destino"
          onSelect={(id) =>
            updateForm((current) => ({ ...current, manualDropoffZone: id }))
          }
          onClose={() => setShowDropoffSelector(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function navigateBack() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/");
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.readRow}>
      <Text style={styles.readLabel}>{label}</Text>
      <Text style={styles.readValue}>{value}</Text>
    </View>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function ChipRow<T extends string>({
  values,
  selected,
  onSelect,
}: {
  values: T[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {values.map((value) => (
        <Pressable
          key={value}
          onPress={() => onSelect(value)}
          style={[styles.chip, selected === value && styles.chipActive]}
        >
          <Text style={styles.chipText}>{value}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ZoneEditor({
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
  return (
    <View style={styles.zoneEditor}>
      <ReadRow label={label} value={value} />
      <View style={styles.zoneActions}>
        <Pressable onPress={onChange}>
          <Text style={styles.link}>Cambiar</Text>
        </Pressable>
        <Pressable onPress={onClear}>
          <Text style={styles.link}>Limpiar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6f2eb",
  },
  content: {
    padding: 20,
    paddingTop: 56,
    gap: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backText: {
    color: "#0066cc",
    fontWeight: "700",
  },
  header: {
    gap: 4,
  },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e8f5e9",
    color: "#1b5e20",
    fontWeight: "800",
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1f1a17",
  },
  subtitle: {
    fontSize: 14,
    color: "#5f564d",
    fontWeight: "700",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2d8cb",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1f1a17",
  },
  readRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  readLabel: {
    flex: 1,
    color: "#6b6258",
    fontSize: 13,
  },
  readValue: {
    flex: 1,
    textAlign: "right",
    color: "#211b17",
    fontWeight: "800",
    fontSize: 13,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2b2521",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8d0c5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#1f1a17",
  },
  helper: {
    fontSize: 12,
    color: "#6b6258",
    lineHeight: 17,
  },
  error: {
    color: "#b42318",
    fontSize: 12,
    fontWeight: "700",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#eee6da",
  },
  chipActive: {
    backgroundColor: "#d1e8ff",
  },
  chipText: {
    fontWeight: "800",
    color: "#1f1a17",
  },
  zoneEditor: {
    gap: 6,
  },
  zoneActions: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "flex-end",
  },
  link: {
    color: "#0066cc",
    fontWeight: "800",
  },
  actions: {
    gap: 8,
  },
  actionSpacer: {
    height: 4,
  },
  dangerZone: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f4b4b4",
    backgroundColor: "#fff5f5",
    gap: 10,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#8a1f11",
  },
});

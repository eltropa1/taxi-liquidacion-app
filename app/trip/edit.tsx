import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useNavigation } from "expo-router";

import { TripService } from "../../src/application/runtime";
import { CorrectRegisteredService } from "../../src/application/trips/CorrectRegisteredService";
import { DeleteRegisteredServiceRecord } from "../../src/application/trips/DeleteRegisteredServiceRecord";
import { PaymentType, TripSource } from "../../src/constants/enums";
import { NeighborhoodSelector } from "../../src/components/forms/NeighborhoodSelector";
import { RecordEnrichmentSection } from "../../src/components/records/RecordEnrichmentSection";
import {
  CorrectionActionBar,
  DestructiveRecordSection,
  DetailSection,
  DetailTextInput,
  Field,
  ReadRow,
  RegisteredServiceDetailHeader,
  SegmentedControl,
  ServiceEconomicSummary,
  ZoneCorrectionRow,
  useDetailTheme,
} from "../../src/components/trips/RegisteredServiceDetailLayout";
import {
  buildRegisteredServiceDetailProjection,
  createRegisteredServiceCorrectionForm,
  formatPaymentTypeLabel,
  formatTripSourceLabel,
  isRegisteredServiceCorrectionFormDirty,
  prepareRegisteredServiceCorrection,
  resolveEffectiveNeighborhoodName,
  resolveTripEditSnapshotZones,
  type RegisteredServiceCorrectionForm,
  type RegisteredServiceRecord,
} from "../../src/presentation";
import type { TripGeoSnapshotRecord } from "../../src/application/ports/persistence";

type ScreenMode = "view" | "correction";

export default function RegisteredServiceDetailScreen() {
  const { styles: detailStyles } = useDetailTheme();
  const insets = useSafeAreaInsets();
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
  const [enrichmentDirty, setEnrichmentDirty] = useState(false);
  const confirmingDiscardRef = useRef(false);
  const allowNavigationRef = useRef(false);

  const prepared = useMemo(() => {
    if (!trip || !form) return null;
    return prepareRegisteredServiceCorrection(trip, form);
  }, [form, trip]);

  const isDirty =
    mode === "correction" && trip && form
      ? isRegisteredServiceCorrectionFormDirty(trip, form)
      : false;
  const hasNavigationDirtyState = Boolean(isDirty || enrichmentDirty);

  const projection = useMemo(() => {
    if (!trip) return null;
    return buildRegisteredServiceDetailProjection({ trip, snapshots });
  }, [trip, snapshots]);

  const enrichmentOwner = useMemo(() => {
    if (!trip) return null;
    return {
      ownerType: "registered_service" as const,
      ownerId: String(trip.id),
    };
  }, [trip]);

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

  const requestNavigationDiscard = useCallback(
    (onDiscard: () => void) => {
      if (!hasNavigationDirtyState) {
        onDiscard();
        return;
      }

      if (confirmingDiscardRef.current) return;
      confirmingDiscardRef.current = true;
      Alert.alert(
        "Descartar los cambios?",
        "Los cambios sin guardar no se conservaran.",
        [
          {
            text: "Seguir en pantalla",
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
              allowNavigationRef.current = true;
              onDiscard();
            },
          },
        ],
      );
    },
    [hasNavigationDirtyState],
  );

  const requestCorrectionDiscard = useCallback(
    (onDiscard: () => void) => {
      if (!isDirty) {
        onDiscard();
        return;
      }

      if (confirmingDiscardRef.current) return;
      confirmingDiscardRef.current = true;
      Alert.alert(
        "Descartar las correcciones?",
        "Los cambios realizados en el servicio no se guardaran.",
        [
          {
            text: "Seguir corrigiendo",
            style: "cancel",
            onPress: () => {
              confirmingDiscardRef.current = false;
            },
          },
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => {
              confirmingDiscardRef.current = false;
              onDiscard();
            },
          },
        ],
      );
    },
    [isDirty],
  );

  const navigateHome = useCallback(() => {
    requestNavigationDiscard(() => router.replace("/"));
  }, [requestNavigationDiscard]);

  useEffect(() => {
    const subscription = navigation.addListener("beforeRemove", (event) => {
      if (allowNavigationRef.current) return;
      if (!hasNavigationDirtyState) return;
      event.preventDefault();
      requestNavigationDiscard(() => navigation.dispatch(event.data.action));
    });

    return subscription;
  }, [hasNavigationDirtyState, navigation, requestNavigationDiscard]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (allowNavigationRef.current) return false;
      if (!hasNavigationDirtyState) return false;
      requestNavigationDiscard(navigateBack);
      return true;
    });

    return () => subscription.remove();
  }, [hasNavigationDirtyState, requestNavigationDiscard]);

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
    requestCorrectionDiscard(() => {
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

      allowNavigationRef.current = true;
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
      "Anular este servicio?",
      enrichmentDirty
        ? "El servicio quedara marcado como anulado y dejara de contar en los totales, pero se conserva para consulta. La nota sin guardar se perdera."
        : "El servicio quedara marcado como anulado y dejara de contar en los totales, pero se conserva para consulta.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Anular servicio",
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
      await DeleteRegisteredServiceRecord.execute(trip.id);
      navigateBack();
    } catch (error) {
      console.error("Error voiding registered service", error);
      Alert.alert(
        "No se ha podido anular",
        "El registro sigue disponible. Intentalo de nuevo.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !projection || !trip || !form) {
    return (
      <View style={detailStyles.centered}>
        <Text>Cargando detalle del servicio...</Text>
      </View>
    );
  }

  const errors = prepared && !prepared.ok ? prepared.errors : {};
  const paymentOptions = [
    PaymentType.CASH,
    PaymentType.CARD,
    PaymentType.APP,
  ].map((payment) => ({
    value: payment,
    label: formatPaymentTypeLabel(payment),
  }));
  const sourceOptions = [
    TripSource.TAXI,
    TripSource.UBER,
    TripSource.CABIFY,
    TripSource.FREE_NOW,
    TripSource.CUSTOM,
  ].map((source) => ({
    value: source,
    label: formatTripSourceLabel(source),
  }));

  return (
    <KeyboardAvoidingView
      style={detailStyles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={detailStyles.screen}>
        <ScrollView
          contentContainerStyle={[
            detailStyles.content,
            mode === "correction" && {
              paddingBottom: 104 + Math.max(insets.bottom, 12),
            },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          <RegisteredServiceDetailHeader
            title={projection.title}
            status={projection.statusLabel}
            schedule={projection.scheduleLabel}
            mode={mode}
            onBack={() => requestNavigationDiscard(navigateBack)}
            onHome={navigateHome}
            onCorrect={startCorrection}
          />

          <ServiceEconomicSummary
            amount={projection.amountLabel}
            payment={projection.paymentLabel}
            source={projection.customSourceLabel ?? projection.sourceLabel}
            chargedAmount={projection.chargedAmountLabel}
            cashTotal={projection.cashTotalReceivedLabel}
            cashTip={projection.cashTipLabel}
          />

          {mode === "view" ? (
            <>
              <DetailSection title="Servicio" icon="receipt-long">
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
                <ReadRow
                  label="Clasificacion"
                  value={projection.sourceLabel}
                  emphasis
                />
                {projection.customSourceLabel && (
                  <ReadRow
                    label="Clasificacion personalizada"
                    value={projection.customSourceLabel}
                  />
                )}
              </DetailSection>

              <DetailSection title="Viaje" icon="route">
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
              </DetailSection>

              <DetailSection title="Ubicacion detectada" icon="my-location">
                <ReadRow label="GEO inicio" value={projection.geoPickupZoneLabel} />
                <ReadRow label="GEO fin" value={projection.geoDropoffZoneLabel} />
                <Text style={detailStyles.helper}>
                  Ubicacion automatica solo lectura.
                </Text>
              </DetailSection>
            </>
          ) : (
            <>
              <DetailSection title="Servicio" icon="receipt-long">
                <Field label="Importe" error={errors.amount}>
                  <DetailTextInput
                    value={form.amountInput}
                    onChangeText={(value) =>
                      updateForm((current) => ({
                        ...current,
                        amountInput: value,
                      }))
                    }
                    keyboardType="default"
                  />
                </Field>

                <Field label="Metodo de pago">
                  <SegmentedControl
                    options={paymentOptions}
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
                </Field>
                <Text style={detailStyles.helper}>
                  Al cambiar el metodo se limpian los importes no aplicables.
                </Text>

              {form.payment === PaymentType.CARD && (
                <Field
                  label="Importe cobrado por tarjeta"
                  error={errors.chargedAmount}
                >
                  <DetailTextInput
                    value={form.chargedAmountInput}
                    onChangeText={(value) =>
                      updateForm((current) => ({
                        ...current,
                        chargedAmountInput: value,
                      }))
                    }
                    keyboardType="default"
                  />
                </Field>
              )}

              {form.payment === PaymentType.CASH && (
                <Field
                  label="Total cobrado en efectivo"
                  error={errors.cashTotalReceived}
                >
                  <DetailTextInput
                    value={form.cashTotalReceivedInput}
                    onChangeText={(value) =>
                      updateForm((current) => ({
                        ...current,
                        cashTotalReceivedInput: value,
                      }))
                    }
                    keyboardType="default"
                  />
                </Field>
              )}

                <Field label="Clasificacion">
                  <SegmentedControl
                    options={sourceOptions}
                    selected={form.source}
                    onSelect={(source) =>
                      updateForm((current) => ({ ...current, source }))
                    }
                  />
                </Field>
              {form.source === TripSource.CUSTOM && (
                <Field
                  label="Clasificacion personalizada"
                  error={errors.customSource}
                >
                  <DetailTextInput
                    value={form.customSourceInput}
                    onChangeText={(value) =>
                      updateForm((current) => ({
                        ...current,
                        customSourceInput: value,
                      }))
                    }
                  />
                </Field>
              )}
            </DetailSection>

            <DetailSection title="Viaje" icon="route">
              <Field label="Hora inicio" error={errors.startTime}>
                <DetailTextInput
                  value={form.startTimeInput}
                  onChangeText={(value) =>
                    updateForm((current) => ({
                      ...current,
                      startTimeInput: value,
                    }))
                  }
                  placeholder="08:30"
                />
              </Field>
              <Field label="Hora fin" error={errors.endTime}>
                <DetailTextInput
                  value={form.endTimeInput}
                  onChangeText={(value) =>
                    updateForm((current) => ({ ...current, endTimeInput: value }))
                  }
                  placeholder="09:10"
                />
              </Field>

              <ZoneCorrectionRow
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
              <ZoneCorrectionRow
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
            </DetailSection>

            <DetailSection title="Ubicacion detectada" icon="my-location">
              <ReadRow label="GEO inicio" value={projection.geoPickupZoneLabel} />
              <ReadRow label="GEO fin" value={projection.geoDropoffZoneLabel} />
              <Text style={detailStyles.helper}>GEO automatico solo lectura.</Text>
            </DetailSection>

            {saveError && <Text style={detailStyles.error}>{saveError}</Text>}
          </>
        )}

        {enrichmentOwner ? (
          <RecordEnrichmentSection
            owner={enrichmentOwner}
            onDirtyChange={setEnrichmentDirty}
          />
        ) : null}

        {mode === "view" ? (
          <DestructiveRecordSection
            deleting={deleting}
            onDelete={confirmDelete}
          />
        ) : null}

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
        {mode === "correction" ? (
          <CorrectionActionBar
            saving={saving}
            onCancel={cancelCorrection}
            onSave={saveCorrection}
          />
        ) : null}
      </View>
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

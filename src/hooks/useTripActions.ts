import { Dispatch, SetStateAction, useCallback } from "react";
import { Alert } from "react-native";

import { PaymentType, TripSource } from "../constants/enums";
import { prepareTripSaveData } from "../domain/trips/tripSavePreparation";
import { CloseTrip } from "../application/trips/CloseTrip";
import { StartTrip } from "../application/trips/StartTrip";
import { UpdateTrip } from "../application/trips/UpdateTrip";
import { OpenWorkday } from "../application/workdays/OpenWorkday";
import { CloseWorkday } from "../application/workdays/CloseWorkday";

type UseTripActionsParams = {
  refreshData: () => Promise<void>;
  setLastPayment: Dispatch<SetStateAction<PaymentType>>;
  setLastSource: Dispatch<SetStateAction<TripSource>>;
};

type CompleteClosedTripInput = {
  tripId: number;
  amountInput: string;
  payment: PaymentType;
  collectedAmountInput: string;
  source: TripSource;
  customSource: string;
};

export function useTripActions({
  refreshData,
  setLastPayment,
  setLastSource,
}: UseTripActionsParams) {
  const refreshScreenReadModel = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const triggerScreenRefresh = useCallback(() => {
    void refreshScreenReadModel().catch(console.error);
  }, [refreshScreenReadModel]);

  const handleStartTrip = useCallback(async () => {
    await StartTrip.execute();
    triggerScreenRefresh();
  }, [triggerScreenRefresh]);

  const handleCloseActiveTrip = useCallback(async () => {
    // Camino crítico: cerrar el viaje y registrar el servicio pendiente.
    const result = await CloseTrip.execute();

    if (result.finalized) {
      if (!result.enrichmentSaved) {
        Alert.alert(
          "Viaje finalizado",
          "No se pudo guardar el enriquecimiento de ubicación, pero el viaje sí quedó finalizado.",
        );
      }
    }

    // Camino de lectura: refrescar la pantalla tras el cierre.
    triggerScreenRefresh();

    return result;
  }, [triggerScreenRefresh]);

  const handleCompleteClosedTrip = useCallback(
    async (
      input: CompleteClosedTripInput,
      options?: { confirmedClosedWorkdayEdit?: boolean },
    ) => {
      const preparedTrip = prepareTripSaveData({
        amountInput: input.amountInput,
        payment: input.payment,
        chargedAmountInput:
          input.payment === PaymentType.CARD || input.payment === PaymentType.APP
            ? input.collectedAmountInput
            : "",
        cashTipInput:
          input.payment === PaymentType.CASH ? input.collectedAmountInput : "",
        source: input.source,
        customSource: input.customSource,
      });

      if (!preparedTrip) return false;

      await UpdateTrip.execute(
        input.tripId,
        preparedTrip.amount,
        input.payment,
        preparedTrip.finalSource as any,
        undefined,
        preparedTrip.chargedAmountValue,
        preparedTrip.cashTip,
        "completed",
        options,
      );

      setLastPayment(input.payment);
      setLastSource(input.source);
      // Camino de lectura: refrescar la pantalla tras registrar el servicio cerrado.
      triggerScreenRefresh();

      return true;
    },
    [triggerScreenRefresh, setLastPayment, setLastSource],
  );

  const handleOpenWorkday = useCallback(async (startOdometer: number) => {
    await OpenWorkday.execute(startOdometer);
    triggerScreenRefresh();
  }, [triggerScreenRefresh]);

  const handleCloseWorkday = useCallback(async (endOdometer?: number | null) => {
    await CloseWorkday.execute(endOdometer);
    triggerScreenRefresh();
  }, [triggerScreenRefresh]);

  return {
    handleStartTrip,
    handleCloseActiveTrip,
    handleCompleteClosedTrip,
    handleOpenWorkday,
    handleCloseWorkday,
  };
}

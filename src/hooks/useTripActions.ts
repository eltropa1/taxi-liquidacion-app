import { Dispatch, SetStateAction, useCallback } from "react";
import { Alert } from "react-native";

import { PaymentType, TripSource } from "../constants/enums";
import { prepareTripSaveData } from "../domain/trips/tripSavePreparation";
import { CloseTrip } from "../application/trips/CloseTrip";
import { StartTrip } from "../application/trips/StartTrip";
import { FinishTrip } from "../application/trips/FinishTrip";
import { CreateManualTrip } from "../application/trips/CreateManualTrip";
import { UpdateTrip } from "../application/trips/UpdateTrip";
import { DeleteTrip } from "../application/trips/DeleteTrip";
import { OpenWorkday } from "../application/workdays/OpenWorkday";
import { CloseWorkday } from "../application/workdays/CloseWorkday";
import { TodayTripRow } from "./useTodayScreen";

type UseTripActionsParams = {
  refreshData: () => Promise<void>;
  setLastPayment: Dispatch<SetStateAction<PaymentType>>;
  setLastSource: Dispatch<SetStateAction<TripSource>>;
  setEditingTrip?: Dispatch<SetStateAction<TodayTripRow | null>>;
  setShowFinishModal?: Dispatch<SetStateAction<boolean>>;
  setAmountInput?: Dispatch<SetStateAction<string>>;
  setCustomSource?: Dispatch<SetStateAction<string>>;
};

type SaveTripInput = {
  editingTrip: TodayTripRow | null;
  amountInput: string;
  payment: PaymentType;
  chargedAmountInput: string;
  cashTipInput: string;
  source: TripSource;
  customSource: string;
};

type CompleteClosedTripInput = {
  tripId: number;
  amountInput: string;
  payment: PaymentType;
  collectedAmountInput: string;
  source: TripSource;
  customSource: string;
};

type DeleteTripInput = {
  editingTrip: TodayTripRow | null;
};

export function useTripActions({
  refreshData,
  setLastPayment,
  setLastSource,
  setEditingTrip,
  setShowFinishModal,
  setAmountInput,
  setCustomSource,
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

  const handleSaveTrip = useCallback(
    async (input: SaveTripInput) => {
      const preparedTrip = prepareTripSaveData({
        amountInput: input.amountInput,
        payment: input.payment,
        chargedAmountInput: input.chargedAmountInput,
        cashTipInput: input.cashTipInput,
        source: input.source,
        customSource: input.customSource,
      });

      if (!preparedTrip) return;

      if (input.editingTrip && input.editingTrip.id === -1) {
        await CreateManualTrip.execute({
          startTime: new Date(input.editingTrip.startTime),
          endTime: new Date(
            input.editingTrip.endTime ?? input.editingTrip.startTime,
          ),
          amount: preparedTrip.amount,
          payment: input.payment,
          source: preparedTrip.finalSource as any,
        });
      } else if (input.editingTrip) {
        await UpdateTrip.execute(
          input.editingTrip.id,
          preparedTrip.amount,
          input.payment,
          preparedTrip.finalSource as any,
        );
      } else {
        try {
          // Camino crítico: registrar el servicio con sus datos esenciales.
          const result = await FinishTrip.execute(
            preparedTrip.amount,
            input.payment,
            preparedTrip.finalSource as any,
            undefined,
            preparedTrip.chargedAmountValue,
            preparedTrip.cashTip,
          );
          if (result.finalized) {
            setLastPayment(input.payment);
            setLastSource(input.source);

            if (!result.enrichmentSaved) {
              Alert.alert(
                "Viaje finalizado",
                "No se pudo guardar el enriquecimiento de ubicación, pero el viaje sí quedó finalizado.",
              );
            }
          }
        } catch (error) {
          console.error("Error finalizing trip", error);
          Alert.alert(
            "No se ha podido finalizar el viaje",
            "Revisa el GPS y vuelve a intentarlo. No se han guardado cambios parciales.",
          );
          return;
        }
      }

      setEditingTrip?.(null);
      setShowFinishModal?.(false);
      setAmountInput?.("");
      setCustomSource?.("");

      // Camino de lectura: refrescar el estado visible de la pantalla.
      triggerScreenRefresh();
    },
    [
      triggerScreenRefresh,
      setAmountInput,
      setCustomSource,
      setEditingTrip,
      setLastPayment,
      setLastSource,
      setShowFinishModal,
    ],
  );

  const handleCompleteClosedTrip = useCallback(
    async (input: CompleteClosedTripInput) => {
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
      );

      setLastPayment(input.payment);
      setLastSource(input.source);
      // Camino de lectura: refrescar la pantalla tras registrar el servicio cerrado.
      triggerScreenRefresh();

      return true;
    },
    [triggerScreenRefresh, setLastPayment, setLastSource],
  );

  const handleDeleteTrip = useCallback(
    async ({ editingTrip }: DeleteTripInput) => {
      if (!editingTrip) return;

      await DeleteTrip.execute(editingTrip.id);
      setEditingTrip?.(null);
      setShowFinishModal?.(false);

      triggerScreenRefresh();
    },
    [triggerScreenRefresh, setEditingTrip, setShowFinishModal],
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
    handleSaveTrip,
    handleCompleteClosedTrip,
    handleDeleteTrip,
    handleOpenWorkday,
    handleCloseWorkday,
  };
}

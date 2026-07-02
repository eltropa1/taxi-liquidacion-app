import { Dispatch, SetStateAction, useCallback } from "react";
import { Alert } from "react-native";

import { PaymentType, TripSource } from "../constants/enums";
import { prepareTripSaveData } from "../domain/trips/tripSavePreparation";
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
  setEditingTrip: Dispatch<SetStateAction<TodayTripRow | null>>;
  setShowFinishModal: Dispatch<SetStateAction<boolean>>;
  setAmountInput: Dispatch<SetStateAction<string>>;
  setCustomSource: Dispatch<SetStateAction<string>>;
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
  const handleStartTrip = useCallback(async () => {
    await StartTrip.execute();
    await refreshData();
  }, [refreshData]);

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

      setEditingTrip(null);
      setShowFinishModal(false);
      setAmountInput("");
      setCustomSource("");

      await refreshData();
    },
    [
      refreshData,
      setAmountInput,
      setCustomSource,
      setEditingTrip,
      setLastPayment,
      setLastSource,
      setShowFinishModal,
    ],
  );

  const handleDeleteTrip = useCallback(
    async ({ editingTrip }: DeleteTripInput) => {
      if (!editingTrip) return;

      await DeleteTrip.execute(editingTrip.id);
      setEditingTrip(null);
      setShowFinishModal(false);

      await refreshData();
    },
    [refreshData, setEditingTrip, setShowFinishModal],
  );

  const handleOpenWorkday = useCallback(async () => {
    await OpenWorkday.execute();
    await refreshData();
  }, [refreshData]);

  const handleCloseWorkday = useCallback(async () => {
    await CloseWorkday.execute();
    await refreshData();
  }, [refreshData]);

  return {
    handleStartTrip,
    handleSaveTrip,
    handleDeleteTrip,
    handleOpenWorkday,
    handleCloseWorkday,
  };
}

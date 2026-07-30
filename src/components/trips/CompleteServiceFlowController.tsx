import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Alert } from "react-native";

import { PaymentType, TripSource } from "../../constants/enums";
import { useTripActions } from "../../hooks/useTripActions";
import { CompleteServiceBottomSheet } from "./CompleteServiceBottomSheet";

export type OpenCompleteServiceFlowParams = Readonly<{
  tripId: number;
  payment: PaymentType;
  source: TripSource;
}>;

export type CompleteServiceFlowControllerHandle = Readonly<{
  openForTrip: (params: OpenCompleteServiceFlowParams) => void;
  openForPendingService: (params: OpenCompleteServiceFlowParams) => void;
}>;

type CompleteServiceFlowControllerProps = Readonly<{
  refreshData: () => Promise<void>;
  setLastPayment: Dispatch<SetStateAction<PaymentType>>;
  setLastSource: Dispatch<SetStateAction<TripSource>>;
  onServiceSaved?: () => void;
  onCompleteLater?: () => Promise<void> | void;
}>;

export const CompleteServiceFlowController = forwardRef<
  CompleteServiceFlowControllerHandle,
  CompleteServiceFlowControllerProps
>(function CompleteServiceFlowController(
  {
    refreshData,
    setLastPayment,
    setLastSource,
    onServiceSaved,
    onCompleteLater,
  }: CompleteServiceFlowControllerProps,
  ref,
) {
  const [showFinishSheet, setShowFinishSheet] = useState(false);
  const [pendingTripId, setPendingTripId] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [payment, setPayment] = useState<PaymentType>(PaymentType.CASH);
  const [source, setSource] = useState<TripSource>(TripSource.TAXI);
  const [chargedAmountInput, setChargedAmountInput] = useState("");

  const { handleCompleteClosedTrip } = useTripActions({
    refreshData,
    setLastPayment,
    setLastSource,
  });

  const resetSheetState = useCallback(() => {
    setShowFinishSheet(false);
    setPendingTripId(null);
    setAmountInput("");
    setChargedAmountInput("");
  }, []);

  const openForTrip = useCallback((params: OpenCompleteServiceFlowParams) => {
    setPendingTripId(params.tripId);
    setShowFinishSheet(true);
    setPayment(params.payment);
    setSource(params.source);
    setAmountInput("");
    setChargedAmountInput("");
  }, []);

  const handleSaveClosedTrip = useCallback(() => {
    if (pendingTripId === null) return;

    const saveInput = {
      tripId: pendingTripId,
      amountInput,
      payment,
      collectedAmountInput: chargedAmountInput,
      source,
      customSource: "",
    };

    // Camino de respuesta instantánea: la hoja se cierra al toque y el guardado
    // real en SQLite continúa en segundo plano.
    resetSheetState();
    onServiceSaved?.();

    handleCompleteClosedTrip(saveInput)
      .then((saved) => {
        if (!saved) {
          Alert.alert(
            "Importe inválido",
            "El servicio no se ha guardado: revisa el importe introducido e inténtalo de nuevo.",
          );
        }
      })
      .catch((error) => {
        console.error("Error guardando servicio cerrado", error);
        Alert.alert(
          "No se ha podido guardar",
          "Revisa los datos e inténtalo de nuevo.",
        );
      });
  }, [
    amountInput,
    chargedAmountInput,
    handleCompleteClosedTrip,
    onServiceSaved,
    payment,
    pendingTripId,
    resetSheetState,
    source,
  ]);

  const handleCompleteLater = useCallback(async () => {
    resetSheetState();
    await onCompleteLater?.();
  }, [onCompleteLater, resetSheetState]);

  useImperativeHandle(
    ref,
    () => ({
      openForTrip,
      openForPendingService: openForTrip,
    }),
    [openForTrip],
  );

  return (
    <CompleteServiceBottomSheet
      visible={showFinishSheet}
      amountInput={amountInput}
      onAmountInputChange={setAmountInput}
      chargedAmountInput={chargedAmountInput}
      onChargedAmountInputChange={setChargedAmountInput}
      payment={payment}
      onPaymentChange={setPayment}
      source={source}
      onSourceChange={setSource}
      onSave={handleSaveClosedTrip}
      onCompleteLater={handleCompleteLater}
    />
  );
});

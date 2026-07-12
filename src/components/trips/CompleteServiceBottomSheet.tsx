import { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PaymentType, TripSource } from "../../constants/enums";
import { VisualCatalog } from "../../domain/visual";
import type { PaymentMethodIdentity } from "../../domain/visual/contracts/PaymentMethodIdentity";
import type { PlatformIdentity } from "../../domain/visual/contracts/PlatformIdentity";

type CompleteServiceBottomSheetProps = Readonly<{
  visible: boolean;
  amountInput: string;
  onAmountInputChange: (value: string) => void;
  chargedAmountInput: string;
  onChargedAmountInputChange: (value: string) => void;
  payment: PaymentType;
  onPaymentChange: (value: PaymentType) => void;
  source: TripSource;
  onSourceChange: (value: TripSource) => void;
  onSave: () => void;
  onCompleteLater: () => void;
}>;

const visiblePlatformIds = new Set(["taxi", "uber", "cabify", "freeNow"]);

const visiblePaymentMethodIds = ["cash", "card", "app"] as const;

function platformIdentityToSource(id: string): TripSource {
  switch (id) {
    case "taxi":
      return TripSource.TAXI;
    case "uber":
      return TripSource.UBER;
    case "cabify":
      return TripSource.CABIFY;
    case "freeNow":
      return TripSource.FREE_NOW;
    default:
      return TripSource.TAXI;
  }
}

function getPaymentIdentity(id: (typeof visiblePaymentMethodIds)[number]) {
  return VisualCatalog.getPaymentMethod(id) as PaymentMethodIdentity | undefined;
}

export function CompleteServiceBottomSheet({
  visible,
  amountInput,
  onAmountInputChange,
  chargedAmountInput,
  onChargedAmountInputChange,
  payment,
  onPaymentChange,
  source,
  onSourceChange,
  onSave,
  onCompleteLater,
}: CompleteServiceBottomSheetProps) {
  const insets = useSafeAreaInsets();

  const platforms = useMemo(
    () => {
      return VisualCatalog.listPlatforms().filter((platform) =>
        visiblePlatformIds.has(platform.id),
      ) as PlatformIdentity[];
    },
    [],
  );

  const paymentMethods = useMemo(
    () => {
      return visiblePaymentMethodIds
        .map((paymentMethodId) => getPaymentIdentity(paymentMethodId))
        .filter(Boolean) as PaymentMethodIdentity[];
    },
    [],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCompleteLater}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.body}>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                  styles.scrollContent,
                  {
                    paddingBottom: insets.bottom + 12,
                  },
                ]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
              >
                <TextInput
                  value={amountInput}
                  onChangeText={onAmountInputChange}
                  keyboardType="decimal-pad"
                  placeholder="0,00"
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                  style={styles.amountInput}
                />

                <TextInput
                  value={chargedAmountInput}
                  onChangeText={onChargedAmountInputChange}
                  keyboardType="decimal-pad"
                  placeholder="Importe cobrado (opcional)"
                  placeholderTextColor="#9CA3AF"
                  style={styles.chargedInput}
                />

                <View style={styles.platformGrid}>
                  {platforms.map((platform) => {
                    const platformSource = platformIdentityToSource(platform.id);
                    const isSelected = source === platformSource;
                    return (
                      <Pressable
                        key={platform.id}
                        onPress={() => onSourceChange(platformSource)}
                        style={({ pressed }) => [
                          styles.platformTile,
                          isSelected && styles.platformTileSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.platformChip,
                            {
                              backgroundColor: platform.surfaceColor,
                              borderColor: platform.onSurfaceColor,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.platformChipText,
                              { color: platform.onSurfaceColor },
                            ]}
                          >
                            {platform.initial}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.sectionSeparator} />

                <View style={styles.paymentGrid}>
                  {paymentMethods.map((method) => {
                    const isSelected =
                      (method.id === "cash" && payment === PaymentType.CASH) ||
                      (method.id === "card" && payment === PaymentType.CARD) ||
                      (method.id === "app" && payment === PaymentType.APP);

                    const nextPayment =
                      method.id === "cash"
                        ? PaymentType.CASH
                        : method.id === "card"
                          ? PaymentType.CARD
                          : PaymentType.APP;

                    return (
                      <Pressable
                        key={method.id}
                        onPress={() => onPaymentChange(nextPayment)}
                        style={({ pressed }) => [
                          styles.paymentTile,
                          isSelected && styles.paymentTileSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.iconSlot}>
                          <Text style={styles.paymentIcon}>{method.icon}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={[styles.actions, { paddingBottom: insets.bottom }]}>
              <Pressable onPress={onSave} style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>Guardar servicio</Text>
              </Pressable>

              <Pressable onPress={onCompleteLater} style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Completar después</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "flex-end",
  },
  keyboardAvoiding: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
    height: "82%",
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: -6,
    },
    elevation: 16,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#E7E0D6",
    marginBottom: 16,
  },
  scroll: {
    flex: 1,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    gap: 14,
  },
  amountInput: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: "#E6E1D7",
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    color: "#111827",
    includeFontPadding: false,
  },
  chargedInput: {
    borderWidth: 1,
    borderColor: "#E5E0D5",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    backgroundColor: "#FAF8F4",
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    gap: 8,
  },
  platformTile: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  platformTileSelected: {
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#FAF8F4",
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 1,
  },
  platformChip: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 0.8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 1,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 1,
  },
  platformChipText: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: "#E9E2D8",
    marginVertical: 2,
  },
  iconSlot: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentTileSelected: {
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#FAF8F4",
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 1,
  },
  paymentTile: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIcon: {
    fontSize: 34,
    fontWeight: "700",
    color: "#111827",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  actions: {
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E9E2D8",
  },
  primaryAction: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  secondaryAction: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9D1C4",
    backgroundColor: "#FAF8F4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#374151",
  },
  pressed: {
    opacity: 0.84,
  },
});

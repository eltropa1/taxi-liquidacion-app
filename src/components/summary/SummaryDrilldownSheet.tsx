import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TripHistory } from "../trip-history";
import type { TripVisualProjection } from "../../presentation";

type SummaryDrilldownSheetProps = Readonly<{
  visible: boolean;
  title: string;
  subtitle: string;
  countLabel: string;
  amountLabel: string;
  trips: readonly TripVisualProjection[];
  onClose: () => void;
  onRegisteredTripPress?: (tripId: number) => void;
  onPendingTripPress?: (trip: TripVisualProjection) => void;
}>;

export function SummaryDrilldownSheet({
  visible,
  title,
  subtitle,
  countLabel,
  amountLabel,
  trips,
  onClose,
  onRegisteredTripPress,
  onPendingTripPress,
}: SummaryDrilldownSheetProps) {
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryMeta}>{countLabel}</Text>
            <Text style={styles.summaryAmount}>{amountLabel}</Text>
          </View>

          <View style={styles.list}>
            <TripHistory
              trips={trips}
              onRegisteredTripPress={onRegisteredTripPress}
              onPendingTripPress={onPendingTripPress}
            />
          </View>
        </View>
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
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 20,
    height: "84%",
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#5f564d",
    lineHeight: 18,
  },
  closeButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#EEE6DA",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2b2521",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(31, 26, 23, 0.12)",
    marginBottom: 8,
  },
  summaryMeta: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5f564d",
  },
  summaryAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1f1a17",
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
});

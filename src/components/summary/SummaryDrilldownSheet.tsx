import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TripHistory } from "../trip-history";
import type { TripVisualProjection } from "../../presentation";
import type { ThemeColors, RadiiTokens, ShadowCardTokens } from "../../presentation/theme/tokens";
import { useAppTheme } from "../../presentation/theme/ThemeProvider";

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
  const { colors: themeColors, radii: themeRadii, shadowCard } = useAppTheme();
  const styles = useMemo(
    () => createStyles(themeColors, themeRadii, shadowCard),
    [themeColors, themeRadii, shadowCard],
  );
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

function createStyles(themeColors: ThemeColors, themeRadii: RadiiTokens, shadowCard: ShadowCardTokens) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: themeColors.surface,
    borderTopLeftRadius: themeRadii.card,
    borderTopRightRadius: themeRadii.card,
    paddingTop: 10,
    paddingHorizontal: 20,
    height: "84%",
    ...shadowCard,
    shadowOffset: { width: 0, height: -1 },
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: themeColors.border,
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
    fontWeight: "600",
    color: themeColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: themeColors.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: themeRadii.button,
    backgroundColor: themeColors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textPrimary,
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
    color: themeColors.textSecondary,
  },
  summaryAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: themeColors.textPrimary,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  });
}

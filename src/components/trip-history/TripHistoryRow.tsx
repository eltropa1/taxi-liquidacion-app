import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { TripVisualProjection } from "../../presentation";
import { getTripHistoryPressIntent } from "./tripHistoryInteraction";
import { useAppTheme } from "../../presentation/theme/ThemeProvider";
import type { ThemeColors } from "../../presentation/theme/tokens";

type TripHistoryRowProps = {
  readonly trip: TripVisualProjection;
  readonly onRegisteredPress?: (tripId: number) => void;
  readonly onPendingPress?: (trip: TripVisualProjection) => void;
};

export const TripHistoryRow = memo(function TripHistoryRow({
  trip,
  onRegisteredPress,
  onPendingPress,
}: TripHistoryRowProps) {
  const { colors: themeColors } = useAppTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const handlePress = () => {
    const intent = getTripHistoryPressIntent(trip);
    if (intent === "completePendingService") {
      onPendingPress?.(trip);
      return;
    }

    if (intent === "editRegisteredService") {
      onRegisteredPress?.(trip.id);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={styles.identityCluster}>
          <View
            style={[
              styles.platformChip,
              {
                backgroundColor: trip.platform.surfaceColor,
                borderColor: trip.platform.onSurfaceColor,
              },
            ]}
          >
            <Text
              style={[
                styles.platformChipText,
                { color: trip.platform.onSurfaceColor },
              ]}
              numberOfLines={1}
            >
              {trip.platform.initial}
            </Text>
          </View>

          <View style={styles.iconSlot}>
            {trip.paymentMethod?.icon ? (
              <Text
                style={styles.paymentIcon}
                numberOfLines={1}
              >
                {trip.paymentMethod.icon}
              </Text>
            ) : null}
          </View>
        </View>

        <Text
          style={styles.schedule}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {trip.schedule.label}
        </Text>

        <View style={styles.rightCluster}>
          {trip.isPendingCompletion ? (
            <View style={styles.pendingChip}>
              <Text style={styles.pendingChipText} numberOfLines={1}>
                Pendiente
              </Text>
            </View>
          ) : (
            <Text style={styles.amount} numberOfLines={1}>
              {trip.amount.label}
            </Text>
          )}

          <Text style={styles.navigation} numberOfLines={1}>
            {trip.navigationGlyph}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  pressed: {
    opacity: 0.78,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 10,
    backgroundColor: "transparent",
  },
  identityCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  iconSlot: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  platformChip: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 0.8,
    alignItems: "center",
    justifyContent: "center",
  },
  platformChipText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  paymentIcon: {
    fontSize: 15,
    fontWeight: "700",
    color: themeColors.textPrimary,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  schedule: {
    fontSize: 13,
    fontWeight: "700",
    color: themeColors.textPrimary,
    flex: 1,
    minWidth: 0,
    textAlign: "center",
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    marginLeft: "auto",
  },
  amount: {
    fontSize: 14,
    fontWeight: "800",
    color: themeColors.textPrimary,
    flexShrink: 0,
    textAlign: "right",
  },
  pendingChip: {
    minWidth: 76,
    minHeight: 24,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themeColors.warningSubtle,
    borderWidth: 1,
    borderColor: themeColors.warningSubtle,
  },
  pendingChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
    color: themeColors.warning,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  navigation: {
    fontSize: 16,
    fontWeight: "700",
    color: themeColors.textSecondary,
    flexShrink: 0,
  },
  });
}

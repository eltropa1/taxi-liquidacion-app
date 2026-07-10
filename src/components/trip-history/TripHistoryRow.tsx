import { Pressable, StyleSheet, Text, View } from "react-native";

import type { TripVisualProjection } from "../../presentation";

type TripHistoryRowProps = {
  readonly trip: TripVisualProjection;
  readonly onPress?: (tripId: number) => void;
};

export function TripHistoryRow({ trip, onPress }: TripHistoryRowProps) {
  const handlePress = () => {
    if (!trip.schedule.endTime) return;
    onPress?.(trip.id);
  };

  const isPendingCompletion = trip.amount.value === null;

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
          {isPendingCompletion ? (
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
}

const styles = StyleSheet.create({
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
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  paymentIcon: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  schedule: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
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
    color: "#111827",
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
    backgroundColor: "#EFE8DD",
    borderWidth: 1,
    borderColor: "#D9D1C4",
  },
  pendingChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
    color: "#7C5A1C",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  navigation: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
    flexShrink: 0,
  },
});

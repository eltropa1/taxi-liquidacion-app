import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.row,
          { backgroundColor: trip.platform.surfaceColor },
        ]}
      >
        <View style={styles.identityCluster}>
          <View style={styles.iconSlot}>
            <Text
              style={[
                styles.serviceIcon,
                { color: trip.platform.onSurfaceColor },
              ]}
              numberOfLines={1}
            >
              {trip.serviceType?.icon ?? "·"}
            </Text>
          </View>

          <View
            style={[
              styles.platformBadge,
              { borderColor: trip.platform.onSurfaceColor },
            ]}
          >
            <Text
              style={[
                styles.platformInitial,
                { color: trip.platform.onSurfaceColor },
              ]}
              numberOfLines={1}
            >
              {trip.platform.initial}
            </Text>
          </View>

          <View style={styles.iconSlot}>
            <MaterialCommunityIcons
              name={getPaymentIconName(trip.paymentMethod?.id)}
              size={13}
              color={trip.platform.onSurfaceColor}
              accessibilityIgnoresInvertColors
            />
          </View>
        </View>

        <Text
          style={[styles.schedule, { color: trip.platform.onSurfaceColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {trip.schedule.label}
        </Text>

        <View style={styles.rightCluster}>
          <Text
            style={[styles.amount, { color: trip.platform.onSurfaceColor }]}
            numberOfLines={1}
          >
            {trip.amount.label}
          </Text>

          <Text
            style={[styles.navigation, { color: trip.platform.onSurfaceColor }]}
            numberOfLines={1}
          >
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
    opacity: 0.7,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    minHeight: 34,
    overflow: "hidden",
    gap: 4,
  },
  identityCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 0,
  },
  iconSlot: {
    width: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  serviceIcon: {
    fontSize: 13,
    fontWeight: "700",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  platformBadge: {
    minWidth: 17,
    height: 17,
    paddingHorizontal: 2,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  platformInitial: {
    fontSize: 10,
    fontWeight: "700",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  paymentIcon: {
    fontSize: 12,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  schedule: {
    fontSize: 10,
    fontWeight: "600",
    flex: 1,
    minWidth: 0,
    textAlign: "center",
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 0,
    marginLeft: "auto",
  },
  amount: {
    fontSize: 13,
    fontWeight: "800",
    flexShrink: 0,
    textAlign: "right",
  },
  navigation: {
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 0,
  },
});

function getPaymentIconName(paymentMethodId?: string | null) {
  switch (paymentMethodId) {
    case "cash":
      return "cash";
    case "card":
      return "credit-card-outline";
    case "bizum":
      return "qrcode-scan";
    case "app":
      return "cellphone";
    case "companyVoucher":
      return "briefcase-outline";
    case "other":
      return "tag-outline";
    default:
      return "circle-small";
  }
}

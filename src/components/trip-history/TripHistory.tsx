import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { TripHistoryEmptyState } from "./TripHistoryEmptyState";
import { TripHistoryRow } from "./TripHistoryRow";
import type { TripHistoryProps } from "./TripHistory.types";
import type { TripVisualProjection } from "../../presentation";

function renderSeparator() {
  return <View style={styles.separator} />;
}

export function TripHistory({
  trips,
  onRegisteredTripPress,
  onPendingTripPress,
  contentBottomPadding = 8,
}: TripHistoryProps) {
  const renderItem = useCallback(
    ({ item }: { item: TripVisualProjection }) => (
      <TripHistoryRow
        trip={item}
        onRegisteredPress={onRegisteredTripPress}
        onPendingPress={onPendingTripPress}
      />
    ),
    [onRegisteredTripPress, onPendingTripPress],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        style={styles.list}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: contentBottomPadding },
        ]}
        ItemSeparatorComponent={renderSeparator}
        renderItem={renderItem}
        ListEmptyComponent={<TripHistoryEmptyState />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  separator: {
    height: 8,
    backgroundColor: "rgba(17, 24, 39, 0.025)",
  },
});

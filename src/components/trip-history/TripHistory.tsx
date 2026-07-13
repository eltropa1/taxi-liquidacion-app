import { FlatList, StyleSheet, View } from "react-native";

import { TripHistoryEmptyState } from "./TripHistoryEmptyState";
import { TripHistoryRow } from "./TripHistoryRow";
import type { TripHistoryProps } from "./TripHistory.types";

export function TripHistory({
  trips,
  onRegisteredTripPress,
  onPendingTripPress,
}: TripHistoryProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TripHistoryRow
            trip={item}
            onRegisteredPress={onRegisteredTripPress}
            onPendingPress={onPendingTripPress}
          />
        )}
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

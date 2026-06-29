import { FlatList, StyleSheet, View } from "react-native";

import { TripHistoryEmptyState } from "./TripHistoryEmptyState";
import { TripHistoryRow } from "./TripHistoryRow";
import type { TripHistoryProps } from "./TripHistory.types";

export function TripHistory({ trips, onTripPress }: TripHistoryProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TripHistoryRow trip={item} onPress={onTripPress} />
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
  listContent: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.65)",
  },
});

import { FlatList, StyleSheet, Text, View } from "react-native";

import { TripHistoryEmptyState } from "./TripHistoryEmptyState";
import { TripHistoryRow } from "./TripHistoryRow";
import type { TripHistoryProps } from "./TripHistory.types";

export function TripHistory({ trips, onTripPress }: TripHistoryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>

      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
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
    marginTop: 4,
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  separator: {
    height: 2,
  },
});

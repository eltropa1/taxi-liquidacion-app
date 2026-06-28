import { StyleSheet, Text, View } from "react-native";

export function TripHistoryEmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No hay viajes registrados</Text>
      <Text style={styles.description}>
        Cuando existan viajes para esta fecha aparecerán aquí.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
  },
  description: {
    marginTop: 4,
  },
});

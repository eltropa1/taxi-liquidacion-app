import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../presentation/theme/ThemeProvider";
import type { ThemeColors } from "../../presentation/theme/tokens";

export function TripHistoryEmptyState() {
  const { colors: themeColors } = useAppTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>No hay viajes registrados</Text>
      <Text style={styles.description}>
        Cuando existan viajes para esta fecha aparecerán aquí.
      </Text>
    </View>
  );
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    container: {
      paddingVertical: 18,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    title: {
      fontWeight: "600",
      color: themeColors.textPrimary,
    },
    description: {
      marginTop: 4,
      color: themeColors.textSecondary,
    },
  });
}

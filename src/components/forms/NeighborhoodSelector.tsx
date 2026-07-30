import { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

import { NEIGHBORHOODS_UI_LIST } from "../../infrastructure/geocoding/catalog/neighborhoods.catalog";
import { SPECIAL_ZONES_CATALOG } from "../../infrastructure/geocoding/catalog/specialZones.catalog";
import type { ThemeColors, RadiiTokens } from "../../presentation/theme/tokens";
import { useAppTheme } from "../../presentation/theme/ThemeProvider";

/**
 * Zonas especiales primero (aeropuerto, estaciones...): son pocas y el
 * taxista las busca por nombre propio, no por orden alfabético de
 * barrio. Los barrios van detrás, ya ordenados alfabéticamente.
 */
const ZONE_UI_LIST = [
  ...SPECIAL_ZONES_CATALOG.map((zone) => ({ id: zone.id, label: zone.name })),
  ...NEIGHBORHOODS_UI_LIST,
];

/**
 * Selector de zona (barrio o zona especial) para uso en UI.
 *
 * - NO tiene lógica de negocio
 * - NO escribe en BD
 * - NO conoce viajes
 * - Devuelve solo el id de la zona seleccionada
 */
export function NeighborhoodSelector(props: {
  visible: boolean;
  title: string;
  onSelect: (neighborhoodId: string) => void;
  onClose: () => void;
}) {
  const { visible, title, onSelect, onClose } = props;
  const { colors: themeColors, radii: themeRadii } = useAppTheme();
  const styles = useMemo(() => createStyles(themeColors, themeRadii), [themeColors, themeRadii]);

  const [query, setQuery] = useState("");

  /**
   * Filtrado simple por texto.
   * - Case insensitive
   * - Sin lógica adicional
   */
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ZONE_UI_LIST;

    return ZONE_UI_LIST.filter((n) => n.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        {/* Buscador */}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar barrio o zona…"
          placeholderTextColor={themeColors.textSecondary}
          style={styles.searchInput}
        />

        {/* Lista */}
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelect(item.id);
                onClose();
              }}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            >
              <Text style={styles.itemText}>{item.label}</Text>
            </Pressable>
          )}
        />

        {/* Cerrar */}
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

// ===================================================
// ESTILOS
// ===================================================

function createStyles(themeColors: ThemeColors, themeRadii: RadiiTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.bg,
      padding: 20,
      paddingTop: 60,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: themeColors.textPrimary,
      marginBottom: 10,
      textAlign: "center",
    },
    searchInput: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: themeRadii.button,
      paddingHorizontal: 12,
      color: themeColors.textPrimary,
      backgroundColor: themeColors.surface,
      marginBottom: 10,
    },
    item: {
      minHeight: 44,
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: themeColors.border,
    },
    itemPressed: {
      opacity: 0.7,
    },
    itemText: {
      fontSize: 16,
      color: themeColors.textPrimary,
    },
    closeButton: {
      minHeight: 44,
      marginTop: 10,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    closeText: {
      color: themeColors.textSecondary,
      fontWeight: "600",
    },
  });
}

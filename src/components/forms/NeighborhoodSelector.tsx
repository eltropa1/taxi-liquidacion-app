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

/**
 * Selector de barrio (uso UI).
 *
 * - NO tiene lógica de negocio
 * - NO escribe en BD
 * - NO conoce viajes
 * - Devuelve solo el id del barrio seleccionado
 */
export function NeighborhoodSelector(props: {
  visible: boolean;
  title: string;
  onSelect: (neighborhoodId: string) => void;
  onClose: () => void;
}) {
  const { visible, title, onSelect, onClose } = props;

  const [query, setQuery] = useState("");

  /**
   * Filtrado simple por texto.
   * - Case insensitive
   * - Sin lógica adicional
   */
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NEIGHBORHOODS_UI_LIST;

    return NEIGHBORHOODS_UI_LIST.filter((n) =>
      n.label.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        {/* Buscador */}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar barrio…"
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
              style={styles.item}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#cc3333",
    fontWeight: "600",
  },
});

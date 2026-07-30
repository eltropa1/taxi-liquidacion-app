import { Component, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Error no controlado en la aplicación", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo ha ido mal</Text>
          <Text style={styles.message}>
            GeoTaxi encontró un error inesperado. Tus datos guardados no se han
            perdido.
          </Text>
          <Pressable onPress={this.handleRetry} style={styles.button}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1b2028",
  },
  message: {
    fontSize: 15,
    color: "#4a5160",
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#1b2028",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

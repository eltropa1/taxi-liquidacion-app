import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { bootstrapApp } from '../src/bootstrap';
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { ThemeProvider } from "../src/presentation/theme/ThemeProvider";

type BootstrapState = "loading" | "ready" | "failed";

/**
 * Layout raíz de la aplicación.
 * No renderiza la app hasta que la base de datos está lista.
 */
export default function RootLayout() {
  const [bootstrapState, setBootstrapState] = useState<BootstrapState>("loading");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function prepareApp() {
      try {
        await bootstrapApp();
        if (!cancelled) setBootstrapState("ready");
      } catch (error) {
        console.error('Error preparando la aplicación', error);
        if (!cancelled) setBootstrapState("failed");
      }
    }

    prepareApp();
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const retryBootstrap = () => {
    setBootstrapState("loading");
    setRetryToken((token) => token + 1);
  };

  if (bootstrapState === "failed") {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>No se pudo iniciar GeoTaxi</Text>
        <Text style={{ textAlign: 'center', color: '#4a5160' }}>
          Hubo un problema al preparar la base de datos local. Cierra y vuelve a
          abrir la aplicación; si el problema persiste, contacta con soporte.
        </Text>
        <Pressable
          onPress={retryBootstrap}
          style={{ marginTop: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, backgroundColor: '#1b2028' }}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700' }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  // Mientras el bootstrap no esté listo, mostramos un loader
  if (bootstrapState !== "ready") {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="trip/edit" />
          </Stack>
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

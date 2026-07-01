import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { bootstrapApp } from '../src/bootstrap';

/**
 * Layout raíz de la aplicación.
 * No renderiza la app hasta que la base de datos está lista.
 */
export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        await bootstrapApp();
        setAppReady(true);
      } catch (error) {
        console.error('Error preparando la aplicación', error);
      }
    }

    prepareApp();
  }, []);

  // Mientras el bootstrap no esté listo, mostramos un loader
  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

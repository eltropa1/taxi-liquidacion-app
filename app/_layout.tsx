import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { runMigrations } from '../src/database/migrations';

/**
 * Layout raíz de la aplicación.
 * No renderiza la app hasta que la base de datos está lista.
 */
export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function prepareDatabase() {
      try {
        await runMigrations();
        setDbReady(true);
      } catch (error) {
        console.error('Error preparando la base de datos', error);
      }
    }

    prepareDatabase();
  }, []);

  // Mientras la BD no esté lista, mostramos un loader
  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

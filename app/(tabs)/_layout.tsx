import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { globalTabRoutes } from "../../src/presentation/navigation/appShellRoutes";
import { useAppTheme } from "../../src/presentation/theme/ThemeProvider";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      {globalTabRoutes.map((route) => (
        <Tabs.Screen
          key={route.name}
          name={route.name}
          options={{
            title: route.title,
            tabBarLabel: route.title,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={route.icon} size={size ?? 24} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

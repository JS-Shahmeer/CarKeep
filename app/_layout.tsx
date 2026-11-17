import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastHost } from "../src/components";
import { MigrationGate } from "../src/db/MigrationGate";
import { rebuildAllNotificationJobs } from "../src/features/reminders";
import { logger } from "../src/lib/logger";
import { ThemeProvider, useTheme } from "../src/theme";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden; nothing to do.
});

function RootStack() {
  const theme = useTheme();

  useEffect(() => {
    // Brief 06: rebuild every scheduled alert on launch, which is the one
    // moment that reliably covers "after reboot or timezone change" too.
    rebuildAllNotificationJobs().catch(() => {
      logger.error("notification_rebuild_failed");
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="car/edit" options={{ presentation: "modal", title: "Add / Edit Car" }} />
      <Stack.Screen name="car/[id]" options={{ title: "Car Detail" }} />
      <Stack.Screen
        name="service/new"
        options={{ presentation: "modal", title: "Add Service Record" }}
      />
      <Stack.Screen name="service/[id]" options={{ title: "Record Detail" }} />
      <Stack.Screen
        name="reminder/edit"
        options={{ presentation: "modal", title: "Add / Edit Reminder" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <QueryClientProvider client={queryClient}>
            <MigrationGate>
              <RootStack />
            </MigrationGate>
          </QueryClientProvider>
          <ToastHost />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

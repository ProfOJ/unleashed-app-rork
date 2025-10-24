import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WitnessProvider } from "@/contexts/WitnessContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="wizard-step1" options={{ headerShown: false }} />
      <Stack.Screen name="wizard-step2" options={{ headerShown: false }} />
      <Stack.Screen name="wizard-step3" options={{ headerShown: false }} />
      <Stack.Screen name="summary" options={{ headerShown: false }} />
      <Stack.Screen name="share" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <WitnessProvider>
          <GestureHandlerRootView style={styles.container}>
            <StatusBar style="light" backgroundColor="#0B1C45" />
            <RootLayoutNav />
          </GestureHandlerRootView>
        </WitnessProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

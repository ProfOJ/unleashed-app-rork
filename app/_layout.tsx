import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WitnessProvider } from "@/contexts/WitnessContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { registerServiceWorker } from "@/lib/registerServiceWorker";
import { NotificationHandler } from "@/components/NotificationHandler";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const pathname = usePathname();
  
  const getStatusBarStyle = () => {
    const lightScreens = ['/dashboard', '/testimonies', '/add-testimony', '/preview-testimony', 
                          '/souls', '/soul-detail', '/leaderboard', '/find-church', '/guides'];
    const darkScreens = ['/index', '/wizard-step1', '/wizard-step2', '/wizard-step3', 
                         '/summary', '/share', '/witness-card', '/onboarding'];
    
    if (lightScreens.includes(pathname)) {
      return 'dark' as const;
    }
    if (darkScreens.includes(pathname)) {
      return 'light' as const;
    }
    return 'dark' as const;
  };
  
  return (
    <View style={styles.wrapper}>
      <StatusBar style={getStatusBarStyle()} />
      {Platform.OS === 'web' && <PWAInstallBanner />}
      <NotificationHandler />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="wizard-step1" options={{ headerShown: false }} />
        <Stack.Screen name="wizard-step2" options={{ headerShown: false }} />
        <Stack.Screen name="wizard-step3" options={{ headerShown: false }} />
        <Stack.Screen name="summary" options={{ headerShown: false }} />
        <Stack.Screen name="share" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    SplashScreen.hideAsync();
    registerServiceWorker();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <WitnessProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </WitnessProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

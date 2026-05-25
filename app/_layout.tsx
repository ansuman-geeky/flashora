/**
 * Root Layout — Expo Router entry point
 *
 * Sets up:
 * - Global providers (gesture handler, safe area)
 * - Root Stack with tab group + tool category stacks
 * - Global NativeWind CSS import
 */

import 'react-native-worklets-core';
import 'react-native-gesture-handler';
import '../global.css';

// Polyfill TextEncoder and TextDecoder for pdf-lib on device
// @ts-ignore
import { TextEncoder, TextDecoder } from 'text-encoding';
if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder;
}

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import mobileAds from 'react-native-google-mobile-ads';
import { initAds } from '@services/adService';
import { initRemoteConfig } from '@services/remoteConfig';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDark } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize AdMob
        try {
          await mobileAds().initialize();
          initAds();
          console.log('[AdMob] Initialized successfully and pre-loading ads');
        } catch (adError) {
          console.warn('[AdMob] Initialization failed:', adError);
        }

        // Initialize Firebase Remote Config
        try {
          await initRemoteConfig();
          console.log('[RemoteConfig] Initialized successfully');
        } catch (rcError) {
          console.warn('[RemoteConfig] Initialization failed:', rcError);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately!
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          {/* Tab group — main app */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Tool category stacks — pushed on top of tabs */}
          <Stack.Screen
            name="pdf"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="qr"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="image"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />

          <Stack.Screen
            name="scanner"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />

          <Stack.Screen
            name="url-shortener"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

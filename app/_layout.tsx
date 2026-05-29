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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import mobileAds from 'react-native-google-mobile-ads';
import { initAds } from '@services/adService';
import { initRemoteConfig } from '@services/remoteConfig';
import { SnackbarProvider } from '../src/contexts/SnackbarContext';
import { View, ActivityIndicator } from 'react-native';

import * as MediaLibrary from 'expo-media-library';

export default function RootLayout() {
  const { isDark } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Request storage permissions directly on app launch
    MediaLibrary.requestPermissionsAsync().then((status) => {
      console.log('[Permissions] Storage status:', status.status);
    }).catch(e => console.warn('Permission error', e));

    // Fire off background services without blocking UI
    mobileAds().initialize().then(() => {
      initAds();
      console.log('[AdMob] Initialized successfully and pre-loading ads');
    }).catch((adError) => {
      console.warn('[AdMob] Initialization failed:', adError);
    });

    initRemoteConfig().then(() => {
      console.log('[RemoteConfig] Initialized successfully');
    }).catch((rcError) => {
      console.warn('[RemoteConfig] Initialization failed:', rcError);
    });

    // Immediately unblock the UI so the user doesn't wait 1+ minutes
    setAppIsReady(true);
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#0D0F14' : '#F4F5F7', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4A65E6" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SnackbarProvider>
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

            <Stack.Screen
              name="activity"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="privacy"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="terms"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="about"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </SnackbarProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

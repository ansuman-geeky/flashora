/**
 * Root Layout — Expo Router entry point
 *
 * Sets up:
 * - Global providers (gesture handler, safe area)
 * - Root Stack with tab group + tool category stacks
 * - Global NativeWind CSS import
 */

import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';

export default function RootLayout() {
  const { isDark } = useTheme();

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
            name="url-shortener"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

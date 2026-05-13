/**
 * Image Category Layout
 */

import { Stack } from 'expo-router';

export default function ImageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="compress" />
      <Stack.Screen name="resize" />
      <Stack.Screen name="crop" />
      <Stack.Screen name="convert" />
      <Stack.Screen name="metadata" />
    </Stack>
  );
}

import React from 'react';
import { Stack } from 'expo-router';

export default function ScannerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="camera" />
      <Stack.Screen name="adjust" />
      <Stack.Screen name="enhance" />
      <Stack.Screen name="export" />
    </Stack>
  );
}

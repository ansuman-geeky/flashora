/**
 * PDF Routes — Stack navigator layout
 */

import { Stack } from 'expo-router';
import { useTheme } from '@hooks/useTheme';

export default function PdfLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}

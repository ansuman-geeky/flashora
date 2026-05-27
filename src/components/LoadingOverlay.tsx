/**
 * LoadingOverlay — Full-screen loading state with animated spinner
 */

import React from 'react';
import { View, Text, ActivityIndicator, type ViewStyle } from 'react-native';

export interface LoadingOverlayProps {
  message?: string;
  visible: boolean;
  className?: string;
  style?: ViewStyle;
}

export function LoadingOverlay({
  message = 'Processing...', visible, className = '', style,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View
      className={`absolute inset-0 items-center justify-center bg-bg/80 dark:bg-bg-dark/80 z-50 ${className}`}
      style={style}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <View className="bg-surface dark:bg-surface-dark rounded-lg p-4 items-center shadow-lg" style={{ elevation: 8 }}>
        <ActivityIndicator size="large" color="#5B5FEF" />
        <Text className="text-sm font-medium text-onSurface dark:text-onSurface-dark mt-2">
          {message}
        </Text>
      </View>
    </View>
  );
}

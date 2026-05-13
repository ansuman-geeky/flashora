/**
 * Divider — Horizontal separator line
 */

import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';

export interface DividerProps {
  /** Optional label in the middle of the divider */
  label?: string;
  /** Spacing above and below */
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: ViewStyle;
}

const SPACING_CLASSES: Record<string, string> = {
  sm: 'my-1',
  md: 'my-2',
  lg: 'my-3',
};

export function Divider({
  label, spacing = 'md', className = '', style,
}: DividerProps) {
  if (label) {
    return (
      <View className={`flex-row items-center ${SPACING_CLASSES[spacing]} ${className}`} style={style}>
        <View className="flex-1 h-px bg-border dark:bg-border-dark" />
        <Text className="px-1.5 text-xs text-text-tertiary dark:text-text-secondary-dark">
          {label}
        </Text>
        <View className="flex-1 h-px bg-border dark:bg-border-dark" />
      </View>
    );
  }

  return (
    <View
      className={`h-px bg-border dark:bg-border-dark ${SPACING_CLASSES[spacing]} ${className}`}
      style={style}
    />
  );
}

/**
 * SectionHeader — Section title with optional action
 *
 * Used for: "Quick Actions", "Recent Tools", "PDF Tools", etc.
 */

import React from 'react';
import { View, Text, Pressable, type ViewStyle } from 'react-native';

export interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
  className?: string;
  style?: ViewStyle;
}

export function SectionHeader({
  title, action, className = '', style,
}: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between px-2 mb-1.5 ${className}`} style={style}>
      <Text className="text-md font-semibold text-onSurface dark:text-onSurface-dark">
        {title}
      </Text>
      {action && (
        <Pressable onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label}>
          <Text className="text-sm font-medium text-primary">
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

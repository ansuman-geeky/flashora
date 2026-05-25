/**
 * EmptyState — Placeholder shown when a list or screen has no content
 *
 * Displays an icon, title, description, and optional action button.
 * Used in: Activity (no history), tool results (no files), etc.
 *
 * Design: centered layout, generous spacing, muted colors.
 */

import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { Button, type ButtonProps } from './Button';
import { useTheme } from '@hooks/useTheme';
import { Colors } from '@design-system/tokens';

export interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: React.ReactNode;
  /** Primary heading */
  title: string;
  /** Supporting description text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    onPress: () => void;
    variant?: ButtonProps['variant'];
  };
  /** Additional NativeWind classes */
  className?: string;
  /** Additional style */
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  style,
}: EmptyStateProps) {
  const { isDark } = useTheme();

  return (
    <View
      className={`
        flex-1 items-center justify-center px-4 py-6
        ${className}
      `}
      style={[{ flex: 1 }, style]}
      accessibilityRole="text"
    >
      {/* Icon container with muted background circle */}
      <View
        className="w-[72px] h-[72px] rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: isDark ? Colors.surfaceRaisedDark : Colors.primaryMuted }}
      >
        {icon}
      </View>

      {/* Title */}
      <Text className="text-lg font-semibold text-text-primary dark:text-text-primary-dark text-center mb-0.5">
        {title}
      </Text>

      {/* Description */}
      <Text className="text-sm text-text-secondary dark:text-text-secondary-dark text-center max-w-[280px] leading-relaxed">
        {description}
      </Text>

      {/* Action button */}
      {action && (
        <View className="mt-3">
          <Button
            label={action.label}
            variant={action.variant ?? 'primary'}
            size="md"
            onPress={action.onPress}
          />
        </View>
      )}
    </View>
  );
}

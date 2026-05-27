/**
 * Badge — Status indicator / label component
 *
 * Variants: default, success, warning, error, info, premium
 * Sizes: sm, md
 *
 * Used for: tool status, premium badges, category labels.
 */

import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'premium';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Badge text */
  label: string;
  /** Color variant */
  variant?: BadgeVariant;
  /** Size preset */
  size?: BadgeSize;
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Additional NativeWind classes */
  className?: string;
  /** Additional style */
  style?: ViewStyle;
}

/** Background classes by variant */
const VARIANT_BG_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surfaceVariant dark:bg-surfaceVariant-dark',
  success: 'bg-secondaryContainer dark:bg-secondaryContainer-dark',
  warning: 'bg-tertiaryContainer dark:bg-tertiaryContainer-dark',
  error: 'bg-errorContainer dark:bg-errorContainer-dark',
  info: 'bg-secondaryContainer dark:bg-secondaryContainer-dark',
  premium: 'bg-primaryContainer dark:bg-primaryContainer-dark',
};

/** Text classes by variant */
const VARIANT_TEXT_CLASSES: Record<BadgeVariant, string> = {
  default: 'text-onSurfaceVariant dark:text-onSurfaceVariant-dark',
  success: 'text-onSecondaryContainer dark:text-onSecondaryContainer-dark',
  warning: 'text-onTertiaryContainer dark:text-onTertiaryContainer-dark',
  error: 'text-onErrorContainer dark:text-onErrorContainer-dark',
  info: 'text-onSecondaryContainer dark:text-onSecondaryContainer-dark',
  premium: 'text-onPrimaryContainer dark:text-onPrimaryContainer-dark',
};

/** Size classes */
const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 rounded-full',
  md: 'px-3 py-1 rounded-full',
};

/** Text size classes */
const TEXT_SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
};

export function Badge({
  label,
  variant = 'default',
  size = 'sm',
  icon,
  className = '',
  style,
}: BadgeProps) {
  return (
    <View
      className={`
        flex-row items-center self-start
        ${SIZE_CLASSES[size]}
        ${VARIANT_BG_CLASSES[variant]}
        ${className}
      `}
      style={style}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      {icon && <View className="mr-0.5">{icon}</View>}
      <Text
        className={`
          font-semibold
          ${TEXT_SIZE_CLASSES[size]}
          ${VARIANT_TEXT_CLASSES[variant]}
        `}
      >
        {label}
      </Text>
    </View>
  );
}

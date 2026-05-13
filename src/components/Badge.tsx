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
  default: 'bg-border-subtle dark:bg-border-dark',
  success: 'bg-accent-muted',
  warning: 'bg-warning-muted',
  error: 'bg-error-muted',
  info: 'bg-info-muted',
  premium: 'bg-primary-muted',
};

/** Text classes by variant */
const VARIANT_TEXT_CLASSES: Record<BadgeVariant, string> = {
  default: 'text-text-secondary dark:text-text-secondary-dark',
  success: 'text-accent',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
  premium: 'text-primary',
};

/** Size classes */
const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 rounded-sm',
  md: 'px-2 py-0.5 rounded-sm',
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

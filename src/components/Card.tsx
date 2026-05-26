/**
 * Card — Surface container component
 *
 * Variants: flat, raised, elevated
 * Supports pressable mode for interactive cards.
 *
 * Design: sharp edges (rounded-md = 12px), monochrome depth via elevation.
 */

import React, { useCallback } from 'react';
import {
  View,
  Pressable,
  type ViewStyle,
  type PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type CardVariant = 'flat' | 'raised' | 'elevated';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant controlling background and shadow */
  variant?: CardVariant;
  /** If provided, the card becomes pressable */
  onPress?: PressableProps['onPress'];
  /** Additional NativeWind classes */
  className?: string;
  /** Additional style (escape hatch) */
  style?: ViewStyle;
  /** Accessibility label for pressable cards */
  accessibilityLabel?: string;
  /** Long press handler */
  onLongPress?: PressableProps['onLongPress'];
  /** Disable press interactions */
  disabled?: boolean;
}

/** Background classes by variant */
const VARIANT_BG_CLASSES: Record<CardVariant, string> = {
  flat: 'bg-surface dark:bg-surface-dark',
  raised: 'bg-surface-raised dark:bg-surface-dark-raised',
  elevated: 'bg-surface dark:bg-surface-dark',
};

/** Shadow/elevation styles (can't do elevation via NativeWind alone) */
const VARIANT_SHADOW_STYLES: Record<CardVariant, ViewStyle> = {
  flat: {},
  raised: { elevation: 2, shadowOpacity: 0.06 },
  elevated: { elevation: 4, shadowOpacity: 0.08 },
};

export function Card({
  children,
  variant = 'flat',
  onPress,
  className = '',
  style,
  accessibilityLabel,
  onLongPress,
  disabled,
}: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (onPress || onLongPress) {
      scale.value = withTiming(0.98, {
        duration: 120,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [onPress, onLongPress, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: 120,
      easing: Easing.out(Easing.quad),
    });
  }, [scale]);

  const baseClasses = `
    rounded-md border border-border dark:border-border-dark p-2
    ${VARIANT_BG_CLASSES[variant]}
    ${className}
  `;

  const shadowStyle = VARIANT_SHADOW_STYLES[variant];

  if (onPress || onLongPress) {
    return (
      <AnimatedPressable
        style={[animatedStyle, shadowStyle, style]}
        className={baseClasses}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View
      style={[shadowStyle, style]}
      className={baseClasses}
    >
      {children}
    </View>
  );
}

/**
 * ProgressBar — Animated progress indicator
 *
 * Variants: default (primary), success, error
 * Supports determinate (0–100%) and indeterminate modes.
 *
 * Uses Reanimated for smooth width transitions (max 200ms).
 */

import React, { useEffect } from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export type ProgressBarVariant = 'default' | 'success' | 'error';

export interface ProgressBarProps {
  /** Progress value between 0 and 100. Set to -1 for indeterminate. */
  progress: number;
  /** Color variant */
  variant?: ProgressBarVariant;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label text (overrides percentage) */
  label?: string;
  /** Height of the progress bar */
  height?: number;
  /** Additional NativeWind classes */
  className?: string;
  /** Additional style */
  style?: ViewStyle;
}

/** Fill color classes by variant */
const VARIANT_FILL_CLASSES: Record<ProgressBarVariant, string> = {
  default: 'bg-primary dark:bg-primary-dark',
  success: 'bg-secondary dark:bg-secondary-dark',
  error: 'bg-error dark:bg-error-dark',
};

/** Label text classes by variant */
const VARIANT_LABEL_CLASSES: Record<ProgressBarVariant, string> = {
  default: 'text-primary dark:text-primary-dark',
  success: 'text-secondary dark:text-secondary-dark',
  error: 'text-error dark:text-error-dark',
};

export function ProgressBar({
  progress,
  variant = 'default',
  showLabel = false,
  label,
  height = 6,
  className = '',
  style,
}: ProgressBarProps) {
  const isIndeterminate = progress < 0;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Determinate animation
  const widthProgress = useSharedValue(0);

  // Indeterminate animation
  const translateX = useSharedValue(-100);

  useEffect(() => {
    if (isIndeterminate) {
      translateX.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) }),
          withTiming(100, { duration: 200, easing: Easing.in(Easing.quad) }),
          withTiming(-100, { duration: 0 })
        ),
        -1, // infinite repeat
        false
      );
    } else {
      widthProgress.value = withTiming(clampedProgress, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [clampedProgress, isIndeterminate, widthProgress, translateX]);

  const determinateStyle = useAnimatedStyle(() => ({
    width: `${widthProgress.value}%` as `${number}%`,
  }));

  const indeterminateStyle = useAnimatedStyle(() => ({
    width: '40%',
    transform: [{ translateX: translateX.value }],
  }));

  const displayLabel =
    label ?? (isIndeterminate ? 'Processing...' : `${clampedProgress}%`);

  return (
    <View className={`${className}`} style={style}>
      {showLabel && (
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            className={`text-sm font-medium ${VARIANT_LABEL_CLASSES[variant]}`}
          >
            {displayLabel}
          </Text>
        </View>
      )}
      <View
        className="w-full rounded-full bg-surfaceVariant dark:bg-surfaceVariant-dark overflow-hidden"
        style={{ height }}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: isIndeterminate ? undefined : clampedProgress,
        }}
      >
        <Animated.View
          className={`h-full rounded-full ${VARIANT_FILL_CLASSES[variant]}`}
          style={isIndeterminate ? indeterminateStyle : determinateStyle}
        />
      </View>
    </View>
  );
}

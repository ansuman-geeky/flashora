/**
 * IconButton — Icon-only pressable button
 *
 * Used for: back navigation, close modals, toolbar actions.
 * Sizes: sm (32px), md (40px), lg (48px)
 */

import React, { useCallback } from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'default' | 'filled' | 'ghost';

export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  icon: React.ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  className?: string;
  style?: ViewStyle;
  accessibilityLabel: string;
}

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: 'w-[32px] h-[32px] rounded-sm',
  md: 'w-[40px] h-[40px] rounded-md',
  lg: 'w-[48px] h-[48px] rounded-lg',
};

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  default: 'bg-transparent',
  filled: 'bg-primary-muted dark:bg-border-dark',
  ghost: 'bg-transparent',
};

export function IconButton({
  icon, size = 'md', variant = 'default',
  className = '', style, disabled, onPress,
  accessibilityLabel, ...rest
}: IconButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withTiming(0.9, { duration: 120, easing: Easing.out(Easing.quad) });
    }
  }, [disabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [scale]);

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      className={`items-center justify-center ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      {...rest}
    >
      {icon}
    </AnimatedPressable>
  );
}

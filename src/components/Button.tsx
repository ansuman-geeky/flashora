/**
 * Button — Primary UI action component
 *
 * Variants: primary, secondary, outline, ghost
 * Sizes: sm, md, lg
 * States: default, pressed, disabled, loading
 *
 * Uses NativeWind for styling. Reanimated for press feedback (scale).
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  /** Button text label */
  label: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  /** Left icon element (use Lucide icon component) */
  leftIcon?: React.ReactNode;
  /** Right icon element */
  rightIcon?: React.ReactNode;
  /** Whether the button fills its container width */
  fullWidth?: boolean;
  /** Additional NativeWind classes */
  className?: string;
  /** Additional style (escape hatch) */
  style?: ViewStyle;
}

/** Container classes by variant */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary dark:bg-primary-dark',
  secondary: 'bg-secondaryContainer dark:bg-secondaryContainer-dark',
  outline: 'bg-transparent border border-outline dark:border-outline-dark',
  ghost: 'bg-transparent',
};

/** Pressed container classes by variant */
const VARIANT_PRESSED_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary/90 dark:bg-primary-dark/90',
  secondary: 'bg-secondaryContainer/80 dark:bg-secondaryContainer-dark/80',
  outline: 'bg-surfaceVariant/30 dark:bg-surfaceVariant-dark/30 border-outline dark:border-outline-dark',
  ghost: 'bg-surfaceVariant/30 dark:bg-surfaceVariant-dark/30',
};

/** Disabled container classes by variant */
const VARIANT_DISABLED_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-onSurface/12 dark:bg-onSurface-dark/12',
  secondary: 'bg-onSurface/12 dark:bg-onSurface-dark/12',
  outline: 'bg-transparent border border-onSurface/12 dark:border-onSurface-dark/12',
  ghost: 'bg-transparent',
};

/** Text classes by variant */
const TEXT_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-onPrimary dark:text-onPrimary-dark',
  secondary: 'text-onSecondaryContainer dark:text-onSecondaryContainer-dark',
  outline: 'text-primary dark:text-primary-dark',
  ghost: 'text-primary dark:text-primary-dark',
};

/** Disabled text classes by variant */
const TEXT_DISABLED_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-onSurface/38 dark:text-onSurface-dark/38',
  secondary: 'text-onSurface/38 dark:text-onSurface-dark/38',
  outline: 'text-onSurface/38 dark:text-onSurface-dark/38',
  ghost: 'text-onSurface/38 dark:text-onSurface-dark/38',
};

/** Size classes for container */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-[36px] px-3 rounded-full',
  md: 'h-[40px] px-6 rounded-full',
  lg: 'h-[48px] px-8 rounded-full',
};

/** Text size classes */
const TEXT_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'text-sm font-medium',
  md: 'text-sm font-medium',
  lg: 'text-base font-medium',
};

/** Spinner size by button size */
const SPINNER_SIZE: Record<ButtonSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'small',
};

/** Spinner color by variant */
const SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#101C2B',
  outline: '#0061A4',
  ghost: '#0061A4',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  style,
  onPress,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!isDisabled) {
      scale.value = withTiming(0.97, {
        duration: 120,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [isDisabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: 120,
      easing: Easing.out(Easing.quad),
    });
  }, [scale]);

  const containerClasses = isDisabled
    ? VARIANT_DISABLED_CLASSES[variant]
    : VARIANT_CLASSES[variant];

  const textClasses = isDisabled
    ? TEXT_DISABLED_CLASSES[variant]
    : TEXT_VARIANT_CLASSES[variant];

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      className={`
        flex-row items-center justify-center
        ${SIZE_CLASSES[size]}
        ${containerClasses}
        ${fullWidth ? 'w-full' : 'self-start'}
        ${className}
      `}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      android_ripple={{ color: 'rgba(150, 150, 150, 0.2)', borderless: false }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size={SPINNER_SIZE[size]}
          color={SPINNER_COLOR[variant]}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            className={`
              ${TEXT_SIZE_CLASSES[size]}
              ${textClasses}
              ${leftIcon ? 'ml-1.5' : ''}
              ${rightIcon ? 'mr-1.5' : ''}
            `}
          >
            {label}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </AnimatedPressable>
  );
}

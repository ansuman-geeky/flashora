/**
 * Input — Text input with label, validation, and error states
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, type TextInputProps, type ViewStyle } from 'react-native';

export type InputVariant = 'default' | 'search';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: InputVariant;
  fullWidth?: boolean;
  className?: string;
  style?: ViewStyle;
  inputClassName?: string;
}

export function Input({
  label, helperText, error, leftIcon, rightIcon,
  variant = 'default', fullWidth = true, className = '',
  style, inputClassName = '', editable = true, multiline = false,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
      setIsFocused(true);
      textInputProps.onFocus?.(e);
    },
    [textInputProps]
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      setIsFocused(false);
      textInputProps.onBlur?.(e);
    },
    [textInputProps]
  );

  const hasError = Boolean(error);
  const isDisabled = !editable;

  let borderClass = 'border-border dark:border-border-dark';
  if (hasError) borderClass = 'border-error';
  else if (isFocused) borderClass = 'border-primary';

  const bgClass = isDisabled
    ? 'bg-border-subtle dark:bg-border-dark'
    : variant === 'search'
      ? 'bg-surface-raised dark:bg-surface-dark-raised'
      : 'bg-surface dark:bg-surface-dark';

  const textColorClass = isDisabled
    ? 'text-text-tertiary'
    : 'text-text-primary dark:text-text-primary-dark';

  return (
    <View className={`${fullWidth ? 'w-full' : ''} ${className}`} style={style}>
      {label && (
        <Text className={`text-sm font-medium mb-0.5 ${hasError ? 'text-error' : 'text-text-primary dark:text-text-primary-dark'}`}>
          {label}
        </Text>
      )}
      <View className={`flex-row items-center border rounded-md ${borderClass} ${bgClass} ${multiline ? 'min-h-[100px] items-start' : 'h-[44px]'} px-1.5`}>
        {leftIcon && <View className="mr-1">{leftIcon}</View>}
        <TextInput
          className={`flex-1 text-base ${textColorClass} ${multiline ? 'py-1.5' : ''} ${inputClassName}`}
          placeholderTextColor="#94A3B8"
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          accessibilityState={{ disabled: isDisabled }}
          {...textInputProps}
        />
        {rightIcon && <View className="ml-1">{rightIcon}</View>}
      </View>
      {(error ?? helperText) && (
        <Text className={`text-xs mt-0.5 ${hasError ? 'text-error' : 'text-text-tertiary dark:text-text-secondary-dark'}`}
          accessibilityRole={hasError ? 'alert' : undefined}>
          {error ?? helperText}
        </Text>
      )}
    </View>
  );
}

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

  let borderClass = 'border-outline dark:border-outline-dark';
  if (hasError) borderClass = 'border-error dark:border-error-dark border-2';
  else if (isFocused) borderClass = 'border-primary dark:border-primary-dark border-2';

  const bgClass = isDisabled
    ? 'bg-surfaceVariant/50 dark:bg-surfaceVariant-dark/50'
    : variant === 'search'
      ? 'bg-surfaceVariant dark:bg-surfaceVariant-dark'
      : 'bg-surface dark:bg-surface-dark';

  const textColorClass = isDisabled
    ? 'text-onSurface/38 dark:text-onSurface-dark/38'
    : 'text-onSurface dark:text-onSurface-dark';

  return (
    <View className={`${fullWidth ? 'w-full' : ''} ${className}`} style={style}>
      {label && (
        <Text className={`text-sm font-medium mb-1 ${hasError ? 'text-error dark:text-error-dark' : isFocused ? 'text-primary dark:text-primary-dark' : 'text-onSurfaceVariant dark:text-onSurfaceVariant-dark'}`}>
          {label}
        </Text>
      )}
      <View className={`flex-row items-center border rounded-md ${borderClass} ${bgClass} ${multiline ? 'min-h-[120px] items-start' : 'h-[56px]'} px-3`}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={`flex-1 text-base ${textColorClass} ${multiline ? 'py-3' : ''} ${inputClassName}`}
          placeholderTextColor="#73777F"
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
        <Text className={`text-xs mt-0.5 ${hasError ? 'text-error' : 'text-outline dark:text-onSurfaceVariant-dark'}`}
          accessibilityRole={hasError ? 'alert' : undefined}>
          {error ?? helperText}
        </Text>
      )}
    </View>
  );
}

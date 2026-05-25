/**
 * ErrorDisplay — User-friendly error message component
 *
 * Maps ToolErrorCode to human-readable messages.
 * Never exposes raw errors to users.
 */

import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { Button } from './Button';
import type { ToolErrorCode } from '@app-types/tool';

/** Human-friendly error messages per error code */
const ERROR_MESSAGES: Record<ToolErrorCode, { title: string; description: string }> = {
  INVALID_FILE: {
    title: 'Invalid File',
    description: 'The selected file appears to be corrupted or empty. Please try a different file.',
  },
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    description: 'The file exceeds the maximum size limit. Try a smaller file or compress it first.',
  },
  UNSUPPORTED_FORMAT: {
    title: 'Unsupported Format',
    description: 'This file format isn\'t supported. Please check the supported formats and try again.',
  },
  STORAGE_FULL: {
    title: 'Storage Full',
    description: 'Your device doesn\'t have enough free space. Free up some storage and try again.',
  },
  PERMISSION_DENIED: {
    title: 'Permission Required',
    description: 'Flashora needs access to continue. Please grant the required permission in Settings.',
  },
  NETWORK_ERROR: {
    title: 'Connection Error',
    description: 'Unable to reach the server. Check your internet connection and try again.',
  },
  PROCESSING_FAILED: {
    title: 'Processing Failed',
    description: 'Something went wrong while processing your file. Please try again.',
  },
  PREMIUM_REQUIRED: {
    title: 'Premium Required',
    description: 'You have reached your daily limit of 5 free operations. Upgrade to Premium for unlimited access.',
  },
};

import { useRouter } from 'expo-router';

export interface ErrorDisplayProps {
  errorCode: ToolErrorCode;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  style?: ViewStyle;
}

export function ErrorDisplay({
  errorCode, onRetry, onDismiss, className = '', style,
}: ErrorDisplayProps) {
  const errorInfo = ERROR_MESSAGES[errorCode];
  const router = useRouter();

  return (
    <View
      className={`bg-error-muted rounded-md p-2 ${className}`}
      style={style}
      accessibilityRole="alert"
    >
      <Text className="text-base font-semibold text-error mb-0.5">
        {errorInfo.title}
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
        {errorInfo.description}
      </Text>
      <View className="flex-row mt-2 gap-1.5">
        {errorCode === 'PREMIUM_REQUIRED' ? (
          <Button 
            label="Go Premium" 
            variant="primary" 
            size="sm" 
            onPress={() => router.push('/(tabs)/premium')} 
          />
        ) : (
          onRetry && (
            <Button label="Try Again" variant="outline" size="sm" onPress={onRetry} />
          )
        )}
        {onDismiss && (
          <Button label="Dismiss" variant="ghost" size="sm" onPress={onDismiss} />
        )}
      </View>
    </View>
  );
}

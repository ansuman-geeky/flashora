/**
 * ScreenHeader — Reusable screen header with back navigation
 *
 * Used by tool screens in stack navigators.
 * Design: clean, minimal, left-aligned title.
 */

import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { IconButton } from './IconButton';
import { useTheme } from '@hooks/useTheme';

export interface ScreenHeaderProps {
  /** Screen title */
  title: string;
  /** Show back button (default: true) */
  showBack?: boolean;
  /** Custom back handler (defaults to router.back) */
  onBack?: () => void;
  /** Right-side action element */
  rightAction?: React.ReactNode;
  /** Additional NativeWind classes */
  className?: string;
  /** Additional style */
  style?: ViewStyle;
}

export function ScreenHeader({
  title,
  showBack = true,
  onBack,
  rightAction,
  className = '',
  style,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`flex-row items-center h-[56px] px-1 ${className}`}
      style={[{ backgroundColor: colors.bg }, style]}
    >
      {/* Back button */}
      {showBack ? (
        <IconButton
          icon={<ChevronLeft size={24} color={colors.textPrimary} />}
          onPress={handleBack}
          accessibilityLabel="Go back"
          size="md"
          variant="ghost"
        />
      ) : (
        <View className="w-[40px]" />
      )}

      {/* Title */}
      <Text
        className="flex-1 text-lg font-semibold text-text-primary dark:text-text-primary-dark mx-1"
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Right action */}
      {rightAction ? (
        rightAction
      ) : (
        <View className="w-[40px]" />
      )}
    </View>
  );
}

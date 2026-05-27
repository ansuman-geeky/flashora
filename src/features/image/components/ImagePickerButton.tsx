/**
 * ImagePickerButton — Pick images from gallery or camera
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ImageIcon, Camera } from 'lucide-react-native';
import { Card } from '@components/Card';
import { Colors } from '@design-system/tokens';
import { useTheme } from '@hooks/useTheme';

interface ImagePickerButtonProps {
  label: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
  type?: 'gallery' | 'camera';
}

export function ImagePickerButton({ label, description, onPress, disabled, type = 'gallery' }: ImagePickerButtonProps) {
  const { isDark, colors } = useTheme();
  const Icon = type === 'camera' ? Camera : ImageIcon;

  return (
    <Card
      variant="flat"
      onPress={disabled ? undefined : onPress}
      className="items-center py-4 mx-2 border-dashed"
      accessibilityLabel={label}
    >
      <View
        className="w-[56px] h-[56px] rounded-full items-center justify-center mb-1.5"
        style={{ backgroundColor: `${colors.primary}15` }}
      >
        <Icon size={24} color={colors.primary} />
      </View>
      <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark">
        {label}
      </Text>
      <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mt-0.5 text-center px-4">
        {description}
      </Text>
    </Card>
  );
}

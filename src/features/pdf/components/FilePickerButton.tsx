/**
 * FilePickerButton — Pick files from device storage
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Upload } from 'lucide-react-native';
import { Card } from '@components/Card';
import { Colors } from '@design-system/tokens';
import { useTheme } from '@hooks/useTheme';

interface FilePickerButtonProps {
  label: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}

export function FilePickerButton({ label, description, onPress, disabled }: FilePickerButtonProps) {
  const { colors } = useTheme();

  return (
    <Card
      variant="flat"
      onPress={disabled ? undefined : onPress}
      className="items-center py-4 mx-2 border-dashed"
      accessibilityLabel={label}
    >
      <View className="w-[56px] h-[56px] rounded-full bg-primary-muted dark:bg-border-dark items-center justify-center mb-1.5">
        <Upload size={24} color={Colors.primary} />
      </View>
      <Text className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
        {label}
      </Text>
      <Text className="text-sm text-text-secondary dark:text-text-secondary-dark mt-0.5 text-center px-4">
        {description}
      </Text>
    </Card>
  );
}

/**
 * ProcessingView — Animated progress shown during tool execution
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Loader } from 'lucide-react-native';
import { ProgressBar } from '@components/ProgressBar';
import { useTheme } from '@hooks/useTheme';

interface ProcessingViewProps {
  toolName: string;
  progress: number;
  message?: string;
}

export function ProcessingView({ toolName, progress, message }: ProcessingViewProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-4">
      <View className="w-[64px] h-[64px] rounded-full items-center justify-center mb-3" style={{ backgroundColor: `${colors.primary}15` }}>
        <Loader size={28} color={colors.primary} />
      </View>
      <Text className="text-lg font-semibold text-onSurface dark:text-onSurface-dark mb-0.5">
        Processing...
      </Text>
      <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark text-center mb-3">
        {message ?? `${toolName} in progress. Please wait.`}
      </Text>
      <View className="w-full max-w-[280px]">
        <ProgressBar progress={progress} showLabel />
      </View>
    </View>
  );
}

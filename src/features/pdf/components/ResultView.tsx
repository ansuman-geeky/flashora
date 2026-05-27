/**
 * ResultView — Success view after tool completion
 *
 * Shows output file info, save and share actions.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, Share2, RotateCcw } from 'lucide-react-native';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { Colors } from '@design-system/tokens';
import { formatFileSize, formatDuration } from '@utils/formatters';
import type { ToolResult } from '@app-types/tool';

import { useSnackbar } from '../../../contexts/SnackbarContext';

interface ResultViewProps {
  result: ToolResult;
  onShare: (uri: string) => void | Promise<void>;
  onDownload?: (uri: string, filename: string) => void | Promise<void>;
  onBackToTools: () => void;
  onProcessAnother: () => void;
  toolName: string;
  successMessage?: string;
}

export function ResultView({ result, onShare, onDownload, onBackToTools, onProcessAnother, toolName, successMessage }: ResultViewProps) {
  const { showSnackbar } = useSnackbar();

  return (
    <View className="flex-1 px-2 pt-3">
      {/* Success indicator */}
      <View className="items-center mb-3">
        <View className="w-[64px] h-[64px] rounded-full bg-accent-muted items-center justify-center mb-1.5">
          <CheckCircle size={32} color={Colors.accent} />
        </View>
        <Text className="text-xl font-bold text-onSurface dark:text-onSurface-dark">
          Done!
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mt-0.5 px-6 text-center">
          {successMessage || `${toolName} completed successfully`}
        </Text>
      </View>

      {/* Output info */}
      <Card variant="raised" className="p-2 mb-3">
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark">
            Output
          </Text>
          <Text className="text-sm font-medium text-onSurface dark:text-onSurface-dark">
            {result.outputNames[0] ?? 'output'}
          </Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark">
            Size
          </Text>
          <Text className="text-sm font-medium text-onSurface dark:text-onSurface-dark">
            {formatFileSize(result.fileSizeBytes)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark">
            Duration
          </Text>
          <Text className="text-sm font-medium text-onSurface dark:text-onSurface-dark">
            {formatDuration(result.durationMs)}
          </Text>
        </View>
      </Card>

      {/* Actions */}
      <View className="gap-1.5">
        <View className="flex-row gap-1.5">
          <Button
            label="Share"
            variant="primary"
            className="flex-1"
            leftIcon={<Share2 size={20} color="#FFFFFF" />}
            onPress={async () => {
              if (result.outputUris[0]) {
                try {
                  await onShare(result.outputUris[0]);
                  showSnackbar('Saved successfully', 'success');
                } catch (e) {
                  // error handled by service
                }
              }
            }}
          />
          {onDownload && (
            <Button
              label="Download"
              variant="outline"
              className="flex-1"
              style={{ backgroundColor: `${Colors.primary}25` }}
              leftIcon={<CheckCircle size={20} color={Colors.primary} />}
              onPress={async () => {
                if (result.outputUris[0]) {
                  try {
                    await onDownload(result.outputUris[0], result.outputNames[0] || 'file.pdf');
                    showSnackbar('Saved successfully', 'success');
                  } catch (e) {
                    // error handled by service
                  }
                }
              }}
            />
          )}
        </View>
        <Button
          label="Back to Tools"
          variant="outline"
          size="lg"
          fullWidth
          onPress={onBackToTools}
        />
        <Button
          label="Process Another"
          variant="ghost"
          size="md"
          fullWidth
          leftIcon={<RotateCcw size={18} color={Colors.textSecondary} />}
          onPress={onProcessAnother}
        />
      </View>
    </View>
  );
}

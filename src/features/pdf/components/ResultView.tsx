/**
 * ResultView — Success view after tool completion
 *
 * Shows output file info, save and share actions.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, Share2, RotateCcw, Download } from 'lucide-react-native';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { useTheme } from '@hooks/useTheme';
import { formatFileSize, formatDuration } from '@utils/formatters';
import type { ToolResult } from '@app-types/tool';
import { useRouter } from 'expo-router';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform, NativeModules } from 'react-native';

import { useSnackbar } from '../../../contexts/SnackbarContext';

interface ResultViewProps {
  result: ToolResult;
  onShare: (uri: string) => void | Promise<void>;
  onBackToTools: () => void;
  onProcessAnother: () => void;
  toolName: string;
  successMessage?: string;
}

export function ResultView({ result, onShare, onBackToTools, onProcessAnother, toolName, successMessage }: ResultViewProps) {
  const { showSnackbar } = useSnackbar();
  const { colors } = useTheme();
  const router = useRouter();

  React.useEffect(() => {
    showSnackbar(
      '✓ Saved Successfully\nStored in Flashora',
      'success',
      { label: 'View Files', onPress: () => router.push('/(tabs)/files' as any) }
    );
  }, []);

  return (
    <View className="flex-1 px-2 pt-3">
      {/* Success indicator */}
      <View className="items-center mb-3">
        <View className="w-[64px] h-[64px] rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: `${colors.primary}15` }}>
          <CheckCircle size={32} color={colors.primary} />
        </View>
        <Text className="text-xl font-bold text-onSurface dark:text-onSurface-dark">
          Done!
        </Text>
        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mt-0.5 px-6 text-center">
          {successMessage || `${toolName} completed successfully`}
        </Text>
        <View className="mt-2 py-1 px-3 rounded-md" style={{ backgroundColor: `${colors.primary}10`, borderWidth: 0.5, borderColor: `${colors.primary}30` }}>
          <Text className="text-xs text-center font-medium" style={{ color: colors.primary }}>
            Stored securely in: Downloads / Flashora
          </Text>
        </View>
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
                } catch (e) {}
              }
            }}
          />
          <Button
            label="Open"
            variant="outline"
            className="flex-1"
            style={{ backgroundColor: `${colors.primary}25` }}
            leftIcon={<CheckCircle size={20} color={colors.primary} />}
            onPress={async () => {
              if (result.outputUris[0]) {
                try {
                  if (Platform.OS === 'android') {
                    const { StorageModule } = NativeModules;
                    if (StorageModule && StorageModule.openFile) {
                      const ext = result.outputNames[0]?.split('.').pop()?.toLowerCase();
                      let mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/pdf';
                      await StorageModule.openFile(result.outputUris[0], mimeType);
                    } else {
                      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                        data: result.outputUris[0],
                        flags: 1,
                      });
                    }
                  } else {
                    await onShare(result.outputUris[0]);
                  }
                } catch (e) {
                  showSnackbar('Could not open file', 'error');
                }
              }
            }}
          />
        </View>
        <Button
          label="Download to Device"
          variant="outline"
          size="lg"
          fullWidth
          leftIcon={<Download size={20} color={colors.primary} />}
          onPress={async () => {
            try {
              const { StorageModule } = NativeModules;
              if (StorageModule && StorageModule.copyFileToDownloads) {
                for (let i = 0; i < result.outputUris.length; i++) {
                  const uri = result.outputUris[i];
                  const name = result.outputNames[i] ?? `output_${i}.pdf`;
                  const ext = name.split('.').pop()?.toLowerCase();
                  const mimeType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/pdf';
                  if (uri) await StorageModule.copyFileToDownloads(uri, name, mimeType);
                }
              } else {
                if (result.outputUris[0]) {
                  await onShare(result.outputUris[0]);
                }
              }
              showSnackbar('Saved to Downloads/Flashora', 'success', { label: 'View', onPress: () => router.push('/(tabs)/files' as any) });
            } catch (e) {
              showSnackbar('Could not save file', 'error');
            }
          }}
        />
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
          leftIcon={<RotateCcw size={18} color={colors.onSurfaceVariant} />}
          onPress={onProcessAnother}
        />
      </View>
    </View>
  );
}

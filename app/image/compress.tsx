/**
 * Compress Image Screen — Pick Image → Select quality → Compress → Download/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { ProcessingView, ResultView } from '@features/pdf/components';
import { ImagePickerButton } from '@features/image/components/ImagePickerButton';
import { pickImages, compressImage } from '@features/image/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import { Colors } from '@design-system/tokens';
import { shareFile } from '@features/pdf/services'; // Reuse these
import type { FileInfo } from '@utils/fileUtils';

const COMPRESSION_LEVELS = [
  { label: 'Low', value: 0.8, description: 'Best quality, larger size' },
  { label: 'Medium', value: 0.5, description: 'Balanced quality and size' },
  { label: 'High', value: 0.2, description: 'Smaller size, lower quality' },
];

export default function CompressImageScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [quality, setQuality] = useState(0.5);
  const processor = useToolProcessor({ toolId: 'image_compress', toolName: 'Compress Image', category: 'image' });

  const handlePick = useCallback(async () => {
    const picked = await pickImages(false);
    if (picked?.[0]) setFile(picked[0]);
  }, []);

  const handleCompress = useCallback(() => {
    if (!file) return;
    void processor.execute(async () => {
      const result = await compressImage(file.uri, { quality });
      return {
        outputUris: [result.uri],
        outputNames: [result.name],
        durationMs: 0,
        fileSizeBytes: result.size,
      };
    });
  }, [file, quality, processor]);

  const handleReset = useCallback(() => {
    setFile(null);
    processor.reset();
  }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Compress Image" showBack={false} />
        <ProcessingView toolName="Compress Image" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Compress Image" />
        <ResultView
          result={processor.result}
          onShare={async (uri) => { void shareFile(uri); }}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="Compress Image"
          successMessage="Image successfully compressed. Check the new file size below!"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Compress Image" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} />
          </View>
        )}

        <ImagePickerButton
          label={file ? 'Change Image' : 'Select Image'}
          description="Choose an image to reduce its file size"
          onPress={handlePick}
        />

        {file && (
          <View className="px-2 mt-4">
            <Card variant="flat" className="p-2 mb-4 bg-surface dark:bg-surface-dark border border-outlineVariant dark:border-outlineVariant-dark">
              <Text className="text-sm font-semibold text-onSurface dark:text-onSurface-dark mb-0.5">Selected Image</Text>
              <Text className="text-xs text-onSurfaceVariant dark:text-onSurfaceVariant-dark">{file.name}</Text>
              <Text className="text-[10px] text-outline mt-0.5">Original size: {(file.size / 1024).toFixed(1)} KB</Text>
            </Card>

            <Text className="text-sm font-medium text-onSurfaceVariant dark:text-onSurfaceVariant-dark mb-2">Select Compression Level</Text>
            <View className="gap-2">
              {COMPRESSION_LEVELS.map((level) => {
                const isActive = quality === level.value;
                return (
                  <Pressable
                    key={level.label}
                    onPress={() => setQuality(level.value)}
                    className={`p-2 rounded-md border ${isActive ? 'bg-primary-muted border-primary' : 'bg-surface dark:bg-surface-dark border-outlineVariant dark:border-outlineVariant-dark'}`}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className={`text-base font-semibold ${isActive ? 'text-primary' : 'text-onSurface dark:text-onSurface-dark'}`}>{level.label}</Text>
                      {isActive && <View className="w-2 h-2 rounded-full bg-primary" />}
                    </View>
                    <Text className={`text-xs ${isActive ? 'text-primary/70' : 'text-onSurfaceVariant dark:text-onSurfaceVariant-dark'}`}>{level.description}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-6">
              <Button label="Compress Now" variant="primary" size="lg" fullWidth onPress={handleCompress} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

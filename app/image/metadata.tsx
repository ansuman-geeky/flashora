/**
 * Remove Metadata Screen — Pick Image → Strip EXIF → Download/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { ProcessingView, ResultView } from '@features/pdf/components';
import { ImagePickerButton } from '@features/image/components/ImagePickerButton';
import { pickImages, compressImage } from '@features/image/services'; // compress without exif
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import { shareFile, saveToGeneralStorage } from '@features/pdf/services';
import type { FileInfo } from '@utils/fileUtils';

export default function RemoveMetadataScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const processor = useToolProcessor({ toolId: 'image_metadata', toolName: 'Remove Metadata', category: 'image' });

  const handlePick = useCallback(async () => {
    const picked = await pickImages(false);
    if (picked?.[0]) setFile(picked[0]);
  }, []);

  const handleStrip = useCallback(() => {
    if (!file) return;
    // Expo ImageManipulator strips EXIF by default when saving
    void processor.execute(async () => {
      const result = await compressImage(file.uri, { quality: 1 });
      return {
        outputUris: [result.uri],
        outputNames: [result.name],
        durationMs: 0,
        fileSizeBytes: result.size,
      };
    });
  }, [file, processor]);

  const handleReset = useCallback(() => {
    setFile(null);
    processor.reset();
  }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Remove Metadata" showBack={false} />
        <ProcessingView toolName="Remove Metadata" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Remove Metadata" />
        <ResultView
          result={processor.result}
          onShare={(uri) => shareFile(uri)}
          onDownload={(uri, name) => saveToGeneralStorage(uri, name, name.endsWith('.png') ? 'image/png' : name.endsWith('.webp') ? 'image/webp' : 'image/jpeg')}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="Remove Metadata"
          successMessage="All metadata (EXIF) has been stripped. Your privacy is now protected!"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Remove Metadata" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} />
          </View>
        )}

        <ImagePickerButton
          label={file ? 'Change Image' : 'Select Image'}
          description="Choose an image to remove privacy metadata (EXIF)"
          onPress={handlePick}
        />

        {file && (
          <View className="px-2 mt-4">
            <Card variant="flat" className="p-2 mb-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
              <Text className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-0.5">Selected Image</Text>
              <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">{file.name}</Text>
            </Card>

            <View className="p-3 bg-primary-muted rounded-md mb-6 border border-primary/20">
              <Text className="text-xs text-primary font-medium">
                This will strip all location data, camera information, and timestamps from the image to protect your privacy.
              </Text>
            </View>

            <Button label="Strip Metadata" variant="primary" size="lg" fullWidth onPress={handleStrip} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

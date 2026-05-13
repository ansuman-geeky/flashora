/**
 * Convert Image Screen — Pick Image → Select format → Convert → Download/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { ProcessingView, ResultView } from '@features/pdf/components';
import { ImagePickerButton } from '@features/image/components/ImagePickerButton';
import { pickImages, convertImage } from '@features/image/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import { shareFile, saveToGeneralStorage } from '@features/pdf/services';
import type { FileInfo } from '@utils/fileUtils';
import type { ImageFormat } from '../types';

const FORMATS: ImageFormat[] = ['jpeg', 'png', 'webp'];

export default function ConvertImageScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('jpeg');
  const processor = useToolProcessor({ toolId: 'image_convert', toolName: 'Convert Image', category: 'image' });

  const handlePick = useCallback(async () => {
    const picked = await pickImages(false);
    if (picked?.[0]) setFile(picked[0]);
  }, []);

  const handleConvert = useCallback(() => {
    if (!file) return;
    void processor.execute(async () => {
      const result = await convertImage(file.uri, targetFormat);
      return {
        outputUris: [result.uri],
        outputNames: [result.name],
        durationMs: 0,
        fileSizeBytes: result.size,
      };
    });
  }, [file, targetFormat, processor]);

  const handleReset = useCallback(() => {
    setFile(null);
    processor.reset();
  }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Convert Image" showBack={false} />
        <ProcessingView toolName="Convert Image" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Convert Image" />
        <ResultView
          result={processor.result}
          onShare={(uri) => { void shareFile(uri); }}
          onDownload={(uri, name) => { void saveToGeneralStorage(uri, name); }}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="Convert Image"
          successMessage={`Image successfully converted to ${targetFormat.toUpperCase()}`}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Convert Image" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} />
          </View>
        )}

        <ImagePickerButton
          label={file ? 'Change Image' : 'Select Image'}
          description="Choose an image to change its file format"
          onPress={handlePick}
        />

        {file && (
          <View className="px-2 mt-4">
            <Card variant="flat" className="p-2 mb-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
              <Text className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-0.5">Selected Image</Text>
              <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">{file.name}</Text>
            </Card>

            <Text className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">Target Format</Text>
            <View className="flex-row gap-2">
              {FORMATS.map((format) => {
                if (format === 'webp' && Platform.OS === 'ios') return null;
                const isActive = targetFormat === format;
                return (
                  <Pressable
                    key={format}
                    onPress={() => setTargetFormat(format)}
                    className={`flex-1 p-3 rounded-md border items-center ${isActive ? 'bg-primary-muted border-primary' : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark'}`}
                  >
                    <Text className={`text-sm font-bold uppercase ${isActive ? 'text-primary' : 'text-text-primary dark:text-text-primary-dark'}`}>
                      {format}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-8">
              <Button label="Convert Now" variant="primary" size="lg" fullWidth onPress={handleConvert} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Resize Image Screen — Pick Image → Enter dimensions → Resize → Download/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { ProcessingView, ResultView } from '@features/pdf/components';
import { ImagePickerButton } from '@features/image/components/ImagePickerButton';
import { pickImages, resizeImage } from '@features/image/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import { shareFile, saveToGeneralStorage } from '@features/pdf/services';
import type { FileInfo } from '@utils/fileUtils';

export default function ResizeImageScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const processor = useToolProcessor({ toolId: 'image_resize', toolName: 'Resize Image', category: 'image' });

  const handlePick = useCallback(async () => {
    const picked = await pickImages(false);
    if (picked?.[0]) setFile(picked[0]);
  }, []);

  const handleResize = useCallback(() => {
    if (!file) return;
    const w = width ? parseInt(width, 10) : undefined;
    const h = height ? parseInt(height, 10) : undefined;
    
    void processor.execute(async () => {
      const result = await resizeImage(file.uri, { width: w, height: h });
      return {
        outputUris: [result.uri],
        outputNames: [result.name],
        durationMs: 0,
        fileSizeBytes: result.size,
      };
    });
  }, [file, width, height, processor]);

  const handleReset = useCallback(() => {
    setFile(null);
    setWidth('');
    setHeight('');
    processor.reset();
  }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Resize Image" showBack={false} />
        <ProcessingView toolName="Resize Image" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Resize Image" />
        <ResultView
          result={processor.result}
          onShare={(uri) => shareFile(uri)}
          onDownload={(uri, name) => saveToGeneralStorage(uri, name, name.endsWith('.png') ? 'image/png' : name.endsWith('.webp') ? 'image/webp' : 'image/jpeg')}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="Resize Image"
          successMessage={`Image successfully resized to ${width || 'auto'}x${height || 'auto'}!`}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Resize Image" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} />
          </View>
        )}

        <ImagePickerButton
          label={file ? 'Change Image' : 'Select Image'}
          description="Choose an image to change its dimensions"
          onPress={handlePick}
        />

        {file && (
          <View className="px-2 mt-4">
            <Card variant="flat" className="p-2 mb-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
              <Text className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-0.5">Selected Image</Text>
              <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">{file.name}</Text>
            </Card>

            <Text className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">Target Dimensions (Pixels)</Text>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Input
                  label="Width"
                  placeholder="e.g. 1080"
                  value={width}
                  onChangeText={setWidth}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Height"
                  placeholder="e.g. 1920"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Text className="text-[10px] text-text-tertiary mt-1">* Leave one blank to maintain aspect ratio</Text>

            <View className="mt-6">
              <Button label="Resize Now" variant="primary" size="lg" fullWidth onPress={handleResize} disabled={!width && !height} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

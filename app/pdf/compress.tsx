/**
 * PDF Compress Screen — Pick PDF → Select quality → Compress → Save/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, compressPdf, shareFile, saveToGeneralStorage } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useRouter } from 'expo-router';
import { useTheme } from '@hooks/useTheme';
import { COMPRESSION_PRESETS, type CompressionQuality } from '@features/pdf/types';
import { Colors } from '@design-system/tokens';
import type { FileInfo } from '@utils/fileUtils';

export default function PdfCompressScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [quality, setQuality] = useState<CompressionQuality>('medium');
  const processor = useToolProcessor({ toolId: 'pdf_compress', toolName: 'Compress PDF', category: 'pdf' });

  const handlePickFile = useCallback(async () => {
    const picked = await pickPdfFiles(false);
    if (picked && picked[0]) setFile(picked[0]);
  }, []);

  const handleCompress = useCallback(() => {
    if (!file) return;
    void processor.execute(() => compressPdf(file, quality));
  }, [file, quality, processor]);

  const handleReset = useCallback(() => { setFile(null); setQuality('medium'); processor.reset(); }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView
        className="flex-1 bg-bg dark:bg-bg-dark"
        edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <ScreenHeader title="Compress PDF" showBack={true} />
        <ProcessingView toolName="Compress PDF" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView
        className="flex-1"
        edges={['top']}
        style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <ScreenHeader title="Compress PDF" />
        <ResultView
          result={processor.result}
          onShare={(uri) => { void shareFile(uri); }}
          onDownload={(uri, name) => { void saveToGeneralStorage(uri, name); }}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="Compress PDF"
          successMessage={
            file && processor.result
              ? `Before: ${(file.size / 1024 / 1024).toFixed(2)} MB\nAfter: ${(processor.result.fileSizeBytes / 1024 / 1024).toFixed(2)} MB\nSaved: ${Math.max(0, Math.round((1 - processor.result.fileSizeBytes / file.size) * 100))}%`
              : undefined
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#F4F5F7' }}
    >
      <ScreenHeader title="Compress PDF" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} />
          </View>
        )}

        <FilePickerButton label="Select PDF" description="Choose a PDF to compress" onPress={handlePickFile} />
        {file && <FileList files={[file]} />}

        {file && (
          <View className="px-2 mt-2">
            <Text className="text-sm font-medium text-onSurface dark:text-onSurface-dark mb-1">
              Compression Level
            </Text>
            {(Object.keys(COMPRESSION_PRESETS) as CompressionQuality[]).map((key) => {
              const preset = COMPRESSION_PRESETS[key];
              const isSelected = quality === key;
              return (
                <Pressable key={key} onPress={() => setQuality(key)} accessibilityRole="radio" accessibilityState={{ checked: isSelected }}>
                  <Card variant={isSelected ? 'raised' : 'flat'} className={`p-1.5 mb-1 ${isSelected ? 'border-primary' : ''}`}>
                    <Text className="text-base font-medium text-onSurface dark:text-onSurface-dark">
                      {preset.label}
                    </Text>
                    <Text className="text-xs text-onSurfaceVariant dark:text-onSurfaceVariant-dark">
                      {preset.description}
                    </Text>
                  </Card>
                </Pressable>
              );
            })}
            <View className="mt-2">
              <Button label="Compress PDF" variant="primary" size="lg" fullWidth onPress={handleCompress} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

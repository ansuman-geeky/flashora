/**
 * Image to PDF Screen — Pick images → Convert → Save/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickImageFiles, imagesToPdf, shareFile, saveToGeneralStorage } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useRouter } from 'expo-router';
import { useTheme } from '@hooks/useTheme';
import type { FileInfo } from '@utils/fileUtils';

export default function ImageToPdfScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const processor = useToolProcessor({ toolId: 'pdf_image_to_pdf', toolName: 'Image to PDF', category: 'pdf' });

  const handlePick = useCallback(async () => {
    const picked = await pickImageFiles();
    if (picked) setFiles((prev) => [...prev, ...picked]);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleConvert = useCallback(() => {
    void processor.execute(() => imagesToPdf(files));
  }, [files, processor]);

  const handleReset = useCallback(() => { setFiles([]); processor.reset(); }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView
        className="flex-1 bg-bg dark:bg-bg-dark"
        edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <ScreenHeader title="Image to PDF" showBack={true} />
        <ProcessingView toolName="Image to PDF" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView
        className="flex-1 bg-bg dark:bg-bg-dark"
        edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <ScreenHeader title="Image to PDF" />
        <ResultView
          result={processor.result}
          onShare={(uri) => { void shareFile(uri); }}
          onDownload={(uri, name) => { void saveToGeneralStorage(uri, name); }}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="Image to PDF"
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
      <ScreenHeader title="Image to PDF" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} />
          </View>
        )}
        <FilePickerButton label="Select Images" description="Choose JPG, PNG, or WebP images to combine into a PDF" onPress={handlePick} />
        <FileList files={files} onRemove={handleRemove} />
        {files.length >= 1 && (
          <View className="px-2 mt-3">
            <Button label={`Convert ${files.length} Image${files.length !== 1 ? 's' : ''} to PDF`} variant="primary" size="lg" fullWidth onPress={handleConvert} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * PDF to Image Screen — Pick PDF → Extract pages as images → Save/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, pdfToImages, shareFile, saveToGeneralStorage } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useRouter } from 'expo-router';
import { useTheme } from '@hooks/useTheme';
import type { FileInfo } from '@utils/fileUtils';

export default function PdfToImageScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const processor = useToolProcessor({ toolId: 'pdf_to_image', toolName: 'PDF to Image', category: 'pdf' });

  const handlePick = useCallback(async () => {
    const picked = await pickPdfFiles(false);
    if (picked && picked[0]) setFile(picked[0]);
  }, []);

  const handleExtract = useCallback(() => {
    if (!file) return;
    void processor.execute(() => pdfToImages(file));
  }, [file, processor]);

  const handleReset = useCallback(() => { setFile(null); processor.reset(); }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView
        className="flex-1 bg-bg dark:bg-bg-dark"
        edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <ScreenHeader title="PDF to Image" showBack={false} />
        <ProcessingView toolName="PDF to Image" progress={processor.progress} />
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
        <ScreenHeader title="PDF to Image" />
        <ResultView
          result={processor.result}
          onShare={(uri) => { void shareFile(uri); }}
          onDownload={(uri, name) => { void saveToGeneralStorage(uri, name); }}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="PDF to Image"
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
      <ScreenHeader title="PDF to Image" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} />
          </View>
        )}
        <FilePickerButton label="Select PDF" description="Choose a PDF to extract pages as images" onPress={handlePick} />
        {file && <FileList files={[file]} />}
        {file && (
          <View className="px-2 mt-3">
            <Button label="Extract Images" variant="primary" size="lg" fullWidth onPress={handleExtract} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

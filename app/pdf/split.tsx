/**
 * PDF Split Screen — Pick PDF → Select pages → Split → Save/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, splitPdf, shareFile, saveToGeneralStorage } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useRouter } from 'expo-router';
import { useTheme } from '@hooks/useTheme';
import type { FileInfo } from '@utils/fileUtils';

export default function PdfSplitScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [pageRange, setPageRange] = useState('');
  const processor = useToolProcessor({ toolId: 'pdf_split', toolName: 'Split PDF', category: 'pdf' });

  const handlePickFile = useCallback(async () => {
    const picked = await pickPdfFiles(false);
    if (picked && picked[0]) setFile(picked[0]);
  }, []);

  const handleSplit = useCallback(() => {
    if (!file) return;
    const pages = pageRange.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    void processor.execute(() => splitPdf(file, pages));
  }, [file, pageRange, processor]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPageRange('');
    processor.reset();
  }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView
        className="flex-1 bg-bg dark:bg-bg-dark"
        edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <ScreenHeader title="Split PDF" showBack={true} />
        <ProcessingView toolName="Split PDF" progress={processor.progress} />
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
        <ScreenHeader title="Split PDF" />
        <ResultView
          result={processor.result}
          onShare={(uri) => { void shareFile(uri); }}
          onDownload={(uri, name) => { void saveToGeneralStorage(uri, name); }}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="Split PDF"
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
      <ScreenHeader title="Split PDF" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} />
          </View>
        )}

        <FilePickerButton label="Select PDF" description="Choose a PDF to extract pages from" onPress={handlePickFile} />
        {file && <FileList files={[file]} />}

        {file && (
          <View className="px-2 mt-2">
            <Input
              label="Page Range"
              placeholder="e.g., 1, 3, 5-8"
              value={pageRange}
              onChangeText={setPageRange}
              helperText="Enter page numbers separated by commas, or ranges like 5-8"
            />
            <View className="mt-2">
              <Button label="Split PDF" variant="primary" size="lg" fullWidth onPress={handleSplit} disabled={!pageRange.trim()} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

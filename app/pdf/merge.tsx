/**
 * PDF Merge Screen — Pick multiple PDFs → Merge → Save/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, mergePdfs, shareFile } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import type { FileInfo } from '@utils/fileUtils';

export default function PdfMergeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const processor = useToolProcessor({ toolId: 'pdf_merge', toolName: 'Merge PDF', category: 'pdf' });

  const handlePickFiles = useCallback(async () => {
    const picked = await pickPdfFiles(true);
    if (picked) {
      setFiles((prev) => [...prev, ...picked]);
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleMerge = useCallback(() => {
    void processor.execute(() => mergePdfs(files));
  }, [files, processor]);

  const handleReset = useCallback(() => {
    setFiles([]);
    processor.reset();
  }, [processor]);

  // Processing state
  if (processor.status === 'processing') {
    return (
      <SafeAreaView
        className="flex-1 bg-bg dark:bg-bg-dark"
        edges={['top']}
        style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <ScreenHeader title="Merge PDF" showBack={true} />
        <ProcessingView toolName="Merge PDF" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  // Completed state
  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView
        className="flex-1 bg-bg dark:bg-bg-dark"
        edges={['top']}
        style={{ flex: 1, backgroundColor: colors.bg }}
      >
        <ScreenHeader title="Merge PDF" />
        <ResultView
          result={processor.result}
          onShare={(uri) => { void shareFile(uri); }}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="Merge PDF"
        />
      </SafeAreaView>
    );
  }

  // Default (idle / failed) state
  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#F4F5F7' }}
    >
      <ScreenHeader title="Merge PDF" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Error banner */}
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay
              errorCode={processor.error.code}
              onRetry={handleReset}
              onDismiss={() => processor.reset()}
            />
          </View>
        )}

        {/* File picker */}
        <FilePickerButton
          label="Select PDF Files"
          description="Choose 2 or more PDFs to merge into one document"
          onPress={handlePickFiles}
        />

        {/* File list */}
        <FileList files={files} onRemove={handleRemoveFile} />

        {/* Merge button */}
        {files.length >= 2 && (
          <View className="px-2 mt-3">
            <Button
              label={`Merge ${files.length} Files`}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleMerge}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

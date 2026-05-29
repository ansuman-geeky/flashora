/**
 * TXT to PDF Screen — Pick TXT → Convert → Download/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { ProcessingView, ResultView, FilePickerButton } from '@features/pdf/components';
import { converterService } from '@features/converter/services/converterService';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import { shareFile } from '@features/pdf/services';
import * as DocumentPicker from 'expo-document-picker';
import { getFileInfo, type FileInfo } from '@utils/fileUtils';

export default function TxtToPdfScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const processor = useToolProcessor({ toolId: 'converter_txt_pdf', toolName: 'TXT to PDF', category: 'pdf' });

  const handlePick = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
      });

      if (!result.canceled && result.assets[0]) {
        const fileInfo = await getFileInfo(result.assets[0].uri);
        setFile(fileInfo);
      }
    } catch (error) {
      console.error('Error picking TXT file:', error);
    }
  }, []);

  const handleConvert = useCallback(() => {
    if (!file) return;
    void processor.execute(async () => {
      const result = await converterService.convert({
        inputFile: file,
        targetFormat: 'pdf',
      });

      if (!result.success) throw new Error(result.error);

      return {
        outputUris: [result.outputFile.uri],
        outputNames: [result.outputFile.name],
        durationMs: 0,
        fileSizeBytes: result.outputFile.size,
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
        <ScreenHeader title="TXT to PDF" showBack={true} />
        <ProcessingView toolName="Converting Text..." progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="TXT to PDF" />
        <ResultView
          result={processor.result}
          onShare={(uri) => { void shareFile(uri); }}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="TXT to PDF"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="TXT to PDF" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} />
          </View>
        )}

        <FilePickerButton
          label={file ? 'Change TXT File' : 'Select TXT File'}
          description="Choose a plain text file to convert to PDF"
          onPress={handlePick}
        />

        {file && (
          <View className="px-2 mt-4">
            <Card variant="flat" className="p-3 mb-6 bg-surface dark:bg-surface-dark border border-outlineVariant dark:border-outlineVariant-dark">
              <Text className="text-sm font-semibold text-onSurface dark:text-onSurface-dark mb-1">Selected File</Text>
              <Text className="text-xs text-onSurfaceVariant dark:text-onSurfaceVariant-dark">{file.name}</Text>
            </Card>

            <Button label="Convert to PDF" variant="primary" size="lg" fullWidth onPress={handleConvert} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { IconButton } from '@components/IconButton';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, getPdfPageCount, reorderPdf, shareFile, saveToGeneralStorage } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useRouter } from 'expo-router';
import { useTheme } from '@hooks/useTheme';
import type { FileInfo } from '@utils/fileUtils';

export default function PdfReorderScreen() {
  const router = useRouter();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([1, 2, 3, 4, 5]);
  const processor = useToolProcessor({ toolId: 'pdf_reorder', toolName: 'Reorder Pages', category: 'pdf' });
  const { colors } = useTheme();

  const handlePick = useCallback(async () => {
    const picked = await pickPdfFiles(false);
    if (picked?.[0]) {
      setFile(picked[0]);
      const count = await getPdfPageCount(picked[0].uri);
      const initialOrder = Array.from({ length: count || 0 }, (_, i) => i + 1);
      setPageOrder(initialOrder);
    }
  }, []);

  const moveUp = useCallback((i: number) => {
    if (i === 0) return;
    setPageOrder((p) => { const n = [...p]; [n[i-1]!, n[i]!] = [n[i]!, n[i-1]!]; return n; });
  }, []);

  const moveDown = useCallback((i: number) => {
    setPageOrder((p) => { if (i >= p.length-1) return p; const n = [...p]; [n[i]!, n[i+1]!] = [n[i+1]!, n[i]!]; return n; });
  }, []);

  const handleReorder = useCallback(() => { if (file) void processor.execute(() => reorderPdf(file, pageOrder)); }, [file, pageOrder, processor]);
  const handleReset = useCallback(() => { setFile(null); setPageOrder([1,2,3,4,5]); processor.reset(); }, [processor]);

  if (processor.status === 'processing') return (<SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}><ScreenHeader title="Reorder Pages" showBack={false} /><ProcessingView toolName="Reorder Pages" progress={processor.progress} /></SafeAreaView>);
  if (processor.status === 'completed' && processor.result) return (<SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}><ScreenHeader title="Reorder Pages" /><ResultView result={processor.result} onShare={(u) => { void shareFile(u); }} onDownload={(u, n) => { void saveToGeneralStorage(u, n); }} onBackToTools={() => router.replace('/(tabs)/tools')} onProcessAnother={handleReset} toolName="Reorder Pages" /></SafeAreaView>);

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScreenHeader title="Reorder Pages" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && <View className="px-2 mb-2"><ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} /></View>}
        <FilePickerButton label="Select PDF" description="Choose a PDF to reorder its pages" onPress={handlePick} />
        {file && <FileList files={[file]} />}
        {file && (
          <View className="px-2 mt-2">
            <Text className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">Page Order</Text>
            {pageOrder.map((page, index) => (
              <Card key={`p-${page}-${index}`} variant="flat" className="flex-row items-center p-1.5 mb-1">
                <GripVertical size={16} color={colors.textTertiary} />
                <Text className="flex-1 text-base font-medium text-text-primary dark:text-text-primary-dark ml-1.5">Page {page}</Text>
                <IconButton icon={<ArrowUp size={16} color={colors.textSecondary} />} onPress={() => moveUp(index)} size="sm" variant="ghost" accessibilityLabel="Move up" disabled={index === 0} />
                <IconButton icon={<ArrowDown size={16} color={colors.textSecondary} />} onPress={() => moveDown(index)} size="sm" variant="ghost" accessibilityLabel="Move down" disabled={index === pageOrder.length - 1} />
              </Card>
            ))}
            <View className="mt-2"><Button label="Apply New Order" variant="primary" size="lg" fullWidth onPress={handleReorder} /></View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

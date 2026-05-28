import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GripVertical } from 'lucide-react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, getPdfPageCount, reorderPdf, shareFile, ensureLocalUri } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useRouter } from 'expo-router';
import { useTheme } from '@hooks/useTheme';
import { PdfProcessorModule } from '../../src/native/PdfProcessor';
import type { FileInfo } from '@utils/fileUtils';

type PageItem = {
  originalIndex: number;
  thumbnailUri?: string;
};

export default function PdfReorderScreen() {
  const router = useRouter();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [pageData, setPageData] = useState<PageItem[]>([]);
  const processor = useToolProcessor({ toolId: 'pdf_reorder', toolName: 'Reorder Pages', category: 'pdf' });
  const { colors } = useTheme();

  const handlePick = useCallback(async () => {
    const picked = await pickPdfFiles(false);
    if (picked?.[0]) {
      setFile(picked[0]);
      const count = await getPdfPageCount(picked[0].uri);
      
      let items = Array.from({ length: count || 0 }, (_, i) => ({ originalIndex: i + 1 }));
      setPageData(items);

      if (PdfProcessorModule) {
        try {
          const localUri = await ensureLocalUri(picked[0].uri);
          const thumbnails = await PdfProcessorModule.renderPageThumbnails(localUri);
          items = items.map((item, index) => ({
            ...item,
            thumbnailUri: thumbnails[index] ? `file://${thumbnails[index]}` : undefined
          }));
          setPageData(items);
        } catch (error) {
          console.warn('Failed to load thumbnails', error);
        }
      }
    }
  }, []);

  const handleReorder = useCallback(() => { 
    if (file) {
      const newOrder = pageData.map(p => p.originalIndex);
      void processor.execute(() => reorderPdf(file, newOrder));
    }
  }, [file, pageData, processor]);

  const handleReset = useCallback(() => { setFile(null); setPageData([]); processor.reset(); }, [processor]);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<PageItem>) => {
    return (
      <ScaleDecorator>
        <Card
          variant="flat"
          style={Object.assign(
            { flexDirection: 'row', alignItems: 'center', padding: 8, marginBottom: 8 },
            isActive ? { backgroundColor: colors.surface, elevation: 5, transform: [{ scale: 1.02 }] } : {}
          ) as any}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            drag();
          }}
          disabled={isActive}
        >
          <GripVertical size={20} color={colors.onSurfaceVariant} style={{ marginRight: 12 }} />
          {item.thumbnailUri ? (
            <Image source={{ uri: item.thumbnailUri }} style={{ width: 40, height: 50, marginRight: 12, borderRadius: 4, resizeMode: 'cover' }} />
          ) : (
            <View style={{ width: 40, height: 50, marginRight: 12, backgroundColor: colors.outlineVariant, borderRadius: 4 }} />
          )}
          <Text className="flex-1 text-base font-medium" style={{ color: colors.onSurface }}>
            Page {item.originalIndex}
          </Text>
        </Card>
      </ScaleDecorator>
    );
  };

  if (processor.status === 'processing') return (<SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}><ScreenHeader title="Reorder Pages" showBack={true} /><ProcessingView toolName="Reorder Pages" progress={processor.progress} /></SafeAreaView>);
  if (processor.status === 'completed' && processor.result) return (<SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}><ScreenHeader title="Reorder Pages" /><ResultView result={processor.result} onShare={(u) => { void shareFile(u); }} onBackToTools={() => router.replace('/(tabs)/tools')} onProcessAnother={handleReset} toolName="Reorder Pages" /></SafeAreaView>);

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScreenHeader title="Reorder Pages" />
      <View className="flex-1 px-4 py-2">
        {processor.error && <View className="mb-2"><ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} /></View>}
        
        {!file && <FilePickerButton label="Select PDF" description="Choose a PDF to reorder its pages" onPress={handlePick} />}
        
        {file && (
          <>
            <FileList files={[file]} />
            <View className="flex-row items-center justify-between mt-4 mb-2">
              <Text className="text-sm font-medium" style={{ color: colors.onSurface }}>Long press and drag to reorder</Text>
            </View>
            <DraggableFlatList
              data={pageData}
              onDragEnd={({ data }) => setPageData(data)}
              keyExtractor={(item) => `page-${item.originalIndex}`}
              renderItem={renderItem}
              containerStyle={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
            <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
              <Button label="Apply New Order" variant="primary" size="lg" fullWidth onPress={handleReorder} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

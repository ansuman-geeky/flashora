/**
 * Add Watermark Screen — Pick PDF → Configure Watermark → Apply → Save/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, pickImageFiles, watermarkPdf, shareFile } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import type { FileInfo } from '@utils/fileUtils';

export default function PdfWatermarkScreen() {
  const { colors, isDark } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkImageUri, setWatermarkImageUri] = useState<string | null>(null);
  
  const [opacity, setOpacity] = useState('0.3');
  const [fontSize, setFontSize] = useState('48');
  
  const processor = useToolProcessor({ toolId: 'pdf_watermark', toolName: 'Add Watermark', category: 'pdf' });
  const router = useRouter();

  const handlePick = useCallback(async () => {
    const picked = await pickPdfFiles(false);
    if (picked?.[0]) setFile(picked[0]);
  }, []);

  const handlePickImage = useCallback(async () => {
    const picked = await pickImageFiles();
    if (picked?.[0]) setWatermarkImageUri(picked[0].uri);
  }, []);

  const handleApply = useCallback(() => {
    if (!file) return;
    if (mode === 'text' && !watermarkText) return;
    if (mode === 'image' && !watermarkImageUri) return;

    const op = Math.min(1, Math.max(0.1, parseFloat(opacity) || 0.3));
    const size = Math.max(10, parseInt(fontSize, 10) || 48);
    
    const textToApply = mode === 'text' ? watermarkText : '';
    const imgToApply = mode === 'image' ? watermarkImageUri : null;

    void processor.execute(() => watermarkPdf(file, textToApply, imgToApply, op, size));
  }, [file, mode, watermarkText, watermarkImageUri, opacity, fontSize, processor]);

  const handleReset = useCallback(() => { 
    setFile(null); 
    setWatermarkImageUri(null);
    processor.reset(); 
  }, [processor]);

  const canApply = file && (mode === 'text' ? watermarkText.length > 0 : watermarkImageUri !== null);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Add Watermark" showBack={true} />
        <ProcessingView toolName="Add Watermark" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Add Watermark" />
        <ResultView 
          result={processor.result} 
          onShare={(u) => { void shareFile(u); }} 
          onBackToTools={() => router.replace('/(tabs)/tools')} 
          onProcessAnother={handleReset} 
          toolName="Add Watermark" 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScreenHeader title="Add Watermark" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay 
              errorCode={processor.error.code} 
              onRetry={handleReset} 
              onDismiss={() => processor.reset()} 
            />
          </View>
        )}
        
        <FilePickerButton 
          label="Select PDF" 
          description="Choose a PDF to watermark" 
          onPress={handlePick} 
        />
        {file && <FileList files={[file]} />}
        
        {file && (
          <View className="px-2 mt-4 gap-2">
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
              <Button 
                label="Text" 
                variant={mode === 'text' ? 'primary' : 'outline'} 
                onPress={() => setMode('text')} 
                style={{ flex: 1 }} 
              />
              <Button 
                label="Image" 
                variant={mode === 'image' ? 'primary' : 'outline'} 
                onPress={() => setMode('image')} 
                style={{ flex: 1 }} 
              />
            </View>

            {mode === 'text' ? (
              <>
                <Input 
                  label="Text" 
                  placeholder="e.g. CONFIDENTIAL" 
                  value={watermarkText} 
                  onChangeText={setWatermarkText} 
                />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Input 
                      label="Opacity (0.1 - 1.0)" 
                      placeholder="0.3" 
                      value={opacity} 
                      onChangeText={setOpacity} 
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input 
                      label="Font Size" 
                      placeholder="48" 
                      value={fontSize} 
                      onChangeText={setFontSize} 
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </>
            ) : (
              <View style={{ gap: 12 }}>
                {!watermarkImageUri ? (
                  <Button label="Select Image" variant="outline" onPress={handlePickImage} />
                ) : (
                  <View style={{ alignItems: 'center', borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 8, padding: 8 }}>
                    <Image source={{ uri: watermarkImageUri }} style={{ width: 100, height: 100, resizeMode: 'contain' }} />
                    <Pressable onPress={handlePickImage} style={{ marginTop: 8 }}>
                      <Text style={{ color: colors.primary }}>Change Image</Text>
                    </Pressable>
                  </View>
                )}
                
                <Input 
                  label="Opacity (0.1 - 1.0)" 
                  placeholder="0.3" 
                  value={opacity} 
                  onChangeText={setOpacity} 
                  keyboardType="numeric"
                />
              </View>
            )}

            <View className="mt-4">
              <Button 
                label="Apply Watermark" 
                variant="primary" 
                size="lg" 
                fullWidth 
                onPress={handleApply} 
                disabled={!canApply} 
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

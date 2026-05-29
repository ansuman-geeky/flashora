/**
 * Unlock PDF Screen — Pick locked PDF → Enter password → Unlock → Save/Share
 * This is a Premium-only feature.
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, unlockPdf, shareFile } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import type { FileInfo } from '@utils/fileUtils';

export default function PdfUnlockScreen() {
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [password, setPassword] = useState('');
  const processor = useToolProcessor({ toolId: 'pdf_unlock', toolName: 'Unlock PDF', category: 'pdf' });
  const router = useRouter();

  const handlePick = useCallback(async () => {
    const picked = await pickPdfFiles(false);
    if (picked?.[0]) setFile(picked[0]);
  }, []);

  const handleUnlock = useCallback(() => {
    if (!file || !password) return;
    void processor.execute(() => unlockPdf(file, password));
  }, [file, password, processor]);

  const handleReset = useCallback(() => { 
    setFile(null); 
    setPassword(''); 
    processor.reset(); 
  }, [processor]);

  const canUnlock = file && password.length > 0;

  if (processor.status === 'processing') {
    return (
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Unlock PDF" showBack={true} />
        <ProcessingView toolName="Unlock PDF" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Unlock PDF" />
        <ResultView 
          result={processor.result} 
          onShare={(u) => { void shareFile(u); }} 
          onBackToTools={() => router.replace('/(tabs)/tools')} 
          onProcessAnother={handleReset} 
          toolName="Unlock PDF" 
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
      <ScreenHeader title="Unlock PDF" />
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
          label="Select Protected PDF" 
          description="Choose a locked PDF to remove its password" 
          onPress={handlePick} 
        />
        {file && <FileList files={[file]} />}
        {file && (
          <View className="px-2 mt-2 gap-1.5">
            <Input 
              label="PDF Password" 
              placeholder="Enter current password" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              autoCapitalize="none" 
            />
            <View className="mt-1">
              <Button 
                label="Unlock PDF" 
                variant="primary" 
                size="lg" 
                fullWidth 
                onPress={handleUnlock} 
                disabled={!canUnlock} 
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

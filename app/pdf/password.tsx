/**
 * Password Lock Screen — Pick PDF → Set password → Protect → Save/Share
 * This is a Premium-only feature.
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock } from 'lucide-react-native';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Badge } from '@components/Badge';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { EmptyState } from '@components/EmptyState';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, passwordProtectPdf, shareFile } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import { useSnackbar } from '../../src/contexts/SnackbarContext';
import type { FileInfo } from '@utils/fileUtils';

export default function PdfPasswordScreen() {
  const { colors } = useTheme();
  const { showSnackbar } = useSnackbar();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const processor = useToolProcessor({ toolId: 'pdf_password', toolName: 'Password Lock', category: 'pdf' });
  const router = useRouter();

  const handlePick = useCallback(async () => {
    const picked = await pickPdfFiles(false);
    if (picked?.[0]) setFile(picked[0]);
  }, []);

  const handleProtect = useCallback(() => {
    if (!file || !password) return;
    void processor.execute(() => passwordProtectPdf(file, password));
  }, [file, password, processor]);

  const handleReset = useCallback(() => { setFile(null); setPassword(''); setConfirmPassword(''); processor.reset(); }, [processor]);

  const passwordError = confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined;
  const canProtect = file && password.length >= 4 && password === confirmPassword;



  if (processor.status === 'processing') return (<SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: '#F4F5F7' }}><ScreenHeader title="Password Lock" showBack={true} /><ProcessingView toolName="Password Lock" progress={processor.progress} /></SafeAreaView>);
  if (processor.status === 'completed' && processor.result) return (<SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}><ScreenHeader title="Password Lock" /><ResultView result={processor.result} onShare={(u) => { void shareFile(u); }} onBackToTools={() => router.replace('/(tabs)/tools')} onProcessAnother={handleReset} toolName="Password Lock" /></SafeAreaView>);

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScreenHeader title="Password Lock" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && <View className="px-2 mb-2"><ErrorDisplay errorCode={processor.error.code} onRetry={handleReset} onDismiss={() => processor.reset()} /></View>}
        <FilePickerButton label="Select PDF" description="Choose a PDF to protect with a password" onPress={handlePick} />
        {file && <FileList files={[file]} />}
        {file && (
          <View className="px-2 mt-2 gap-1.5">
            <Input label="Password" placeholder="Minimum 4 characters" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
            <Input label="Confirm Password" placeholder="Re-enter password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" error={passwordError} />
            <View className="mt-1"><Button label="Lock PDF" variant="primary" size="lg" fullWidth onPress={handleProtect} disabled={!canProtect} /></View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

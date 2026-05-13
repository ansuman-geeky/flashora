/**
 * Crop Image Screen — Pick Image → Crop → Download/Share
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { ProcessingView, ResultView } from '@features/pdf/components';
import { ImagePickerButton } from '@features/image/components/ImagePickerButton';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import { shareFile, saveToGeneralStorage } from '@features/pdf/services';
import * as ImagePicker from 'expo-image-picker';
import { getFileInfo, type FileInfo } from '@utils/fileUtils';

export default function CropImageScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  const processor = useToolProcessor({ toolId: 'image_crop', toolName: 'Crop Image', category: 'image' });

  const handlePickAndCrop = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const fileInfo = await getFileInfo(result.assets[0].uri);
        setFile(fileInfo);
        
        // Immediately treat as "completed" result since cropping happened in native UI
        void processor.execute(async () => {
          return {
            outputUris: [fileInfo.uri],
            outputNames: [fileInfo.name],
            durationMs: 0,
            fileSizeBytes: fileInfo.size,
          };
        });
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  }, [processor]);

  const handleReset = useCallback(() => {
    setFile(null);
    processor.reset();
  }, [processor]);

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Crop Image" />
        <ResultView
          result={processor.result}
          onShare={(uri) => { void shareFile(uri); }}
          onDownload={(uri, name) => { void saveToGeneralStorage(uri, name); }}
          onBackToTools={() => router.replace('/(tabs)/tools')}
          onProcessAnother={handleReset}
          toolName="Crop Image"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Crop Image" />
      <View className="flex-1 justify-center px-4">
        <ImagePickerButton
          label="Pick & Crop Image"
          description="Open your gallery to select and crop an image"
          onPress={handlePickAndCrop}
        />
        <Text className="text-xs text-text-tertiary text-center mt-3 px-4">
          Crops are handled using your device's native editor for the best precision.
        </Text>
      </View>
    </SafeAreaView>
  );
}

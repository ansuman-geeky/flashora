/**
 * QrGenerator — Component for rendering and sharing generated QR codes
 */

import React, { useRef } from 'react';
import { View, Text, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { Download, Share2 } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';

interface QrGeneratorProps {
  value: string;
  label?: string;
  onReset: () => void;
  onBackToTools: () => void;
}

export function QrGenerator({ value, label, onReset, onBackToTools }: QrGeneratorProps) {
  const qrRef = useRef<any>(null);

  const handleShare = async () => {
    if (!qrRef.current) return;

    qrRef.current.toDataURL(async (data: string) => {
      const filename = `flashora_qr_${Date.now()}.png`;
      const filePath = `${FileSystem.cacheDirectory}${filename}`;

      try {
        await FileSystem.writeAsStringAsync(filePath, data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath);
        } else {
          void Share.share({ title: 'Flashora QR', message: value });
        }
      } catch (error) {
        console.error('Error sharing QR:', error);
      }
    });
  };

  return (
    <View className="items-center px-4 pt-4">
      <Card variant="raised" className="p-4 items-center bg-white">
        <QRCode
          value={value}
          size={200}
          getRef={(ref) => (qrRef.current = ref)}
        />
      </Card>

      <View className="mt-4 w-full">
        <Text className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1 text-center">
          {label ?? 'Generated QR Code'}
        </Text>
        <Text className="text-xs text-text-tertiary text-center mb-4" numberOfLines={2}>
          {value}
        </Text>

        <View className="gap-2">
          <Button
            label="Share QR Code"
            variant="primary"
            leftIcon={<Share2 size={20} color="#FFFFFF" />}
            onPress={handleShare}
            fullWidth
          />
          <Button
            label="Back to Tools"
            variant="outline"
            onPress={onBackToTools}
            fullWidth
          />
          <Button
            label="Create Another"
            variant="ghost"
            onPress={onReset}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

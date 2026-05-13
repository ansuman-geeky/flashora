/**
 * QR Scan Screen — Camera view + Result card
 */

import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { QrScanner } from '@features/qr/components/QrScanner';
import { QrResultCard } from '@features/qr/components/QrResultCard';
import { parseQrString } from '@features/qr/services/qrService';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { ScanningResult } from 'expo-camera';
import { QrData } from '@features/qr/types';
import { useRouter } from 'expo-router';
import { useTheme } from '@hooks/useTheme';

export default function QrScanScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [scannedData, setScannedData] = useState<QrData | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const processor = useToolProcessor({
    toolId: 'qr_scan',
    toolName: 'Scan QR',
    category: 'qr',
  });

  const handleScan = useCallback((result: ScanningResult) => {
    const data = parseQrString(result.data);
    setScannedData(data);
    setIsScanning(false);

    // Record success in processor (logs analytics + history)
    void processor.execute(async () => {
      return {
        outputUris: [],
        outputNames: [data.label],
        durationMs: 0,
        fileSizeBytes: 0,
      };
    });
  }, [processor]);

  const handleClose = () => {
    if (scannedData) {
      setScannedData(null);
      setIsScanning(true);
      processor.reset();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#000000' }}
    >
      {!scannedData && <ScreenHeader title="Scan QR Code" />}

      {isScanning && !scannedData ? (
        <QrScanner
          onScan={handleScan}
          onClose={() => router.back()}
        />
      ) : scannedData ? (
        <View className="flex-1 bg-bg dark:bg-bg-dark" style={{ flex: 1, backgroundColor: colors.bg }}>
          <ScreenHeader title="Scan Result" />
          <QrResultCard
            data={scannedData}
            onClose={handleClose}
            onBackToTools={() => router.replace('/(tabs)/tools')}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

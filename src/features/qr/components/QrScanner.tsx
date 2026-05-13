/**
 * QrScanner — Camera view for scanning QR codes
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions, ScanningResult } from 'expo-camera';
import { Button } from '@components/Button';
import { IconButton } from '@components/IconButton';
import { X, Zap, ZapOff } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

interface QrScannerProps {
  onScan: (result: ScanningResult) => void;
  onClose: () => void;
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = (result: ScanningResult) => {
    if (scanned) return;
    setScanned(true);
    onScan(result);
  };

  if (!permission) {
    return <View className="flex-1 bg-black items-center justify-center"><Text className="text-white">Requesting permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-4">
        <Text className="text-white text-center mb-2">We need your permission to show the camera</Text>
        <Button label="Grant Permission" onPress={requestPermission} variant="primary" />
        <View className="mt-2">
          <Button label="Cancel" onPress={onClose} variant="ghost" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.topArea}>
            <View className="flex-row justify-between w-full px-4 pt-4">
              <IconButton
                icon={<X color="#FFFFFF" size={24} />}
                onPress={onClose}
                variant="ghost"
                accessibilityLabel="Close scanner"
              />
              <IconButton
                icon={torch ? <Zap color="#FFFFFF" size={24} /> : <ZapOff color="#FFFFFF" size={24} />}
                onPress={() => setTorch(!torch)}
                variant="ghost"
                accessibilityLabel="Toggle torch"
              />
            </View>
            <Text className="text-white text-lg font-semibold mt-4">Align QR code to scan</Text>
          </View>

          <View style={styles.middleArea}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>

          <View style={styles.bottomArea}>
            <Text className="text-white/70 text-sm mb-4">Position the QR code within the frame</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  topArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  middleArea: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  bottomArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Colors.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

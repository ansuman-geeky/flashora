import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, PhotoFile, FrameProcessor } from 'react-native-vision-camera';

export interface CameraViewRef {
  takePhoto: () => Promise<PhotoFile | undefined>;
}

interface CameraViewProps {
  flashMode: 'on' | 'off' | 'auto';
  isActive: boolean;
  frameProcessor?: FrameProcessor;
}

export const CameraView = forwardRef<CameraViewRef, CameraViewProps>(({ flashMode, isActive, frameProcessor }, ref) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  useImperativeHandle(ref, () => ({
    takePhoto: async () => {
      if (cameraRef.current && device) {
        return await cameraRef.current.takePhoto({
          flash: device.hasFlash ? flashMode : 'off',
        });
      }
      return undefined;
    }
  }));

  if (!hasPermission || !device) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.text}>{!device ? 'No camera found' : 'Requesting permission...'}</Text>
      </View>
    );
  }

  return (
    <Camera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
      photo={true}
      enableZoomGesture
      frameProcessor={frameProcessor}
      // Reanimated frame processors need this in v3+
      pixelFormat="yuv"
    />
  );
});

const styles = StyleSheet.create({
  placeholder: { flex: 1, backgroundColor: '#000', items: 'center', justifyContent: 'center' },
  text: { color: '#FFF' }
});

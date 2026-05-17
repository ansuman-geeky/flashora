import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  StatusBar,
  Dimensions,
  Image,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Zap, 
  Image as ImageIcon, 
  X
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Animated, { 
  useAnimatedProps,
  withTiming, 
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { CameraView, CameraViewRef } from '../../src/features/scanner/components/CameraView';
import { EdgeOverlay } from '../../src/features/scanner/components/EdgeOverlay';
import { useScannerStore } from '../../src/features/scanner/store/useScannerStore';
import { useDocumentFrameProcessor } from '../../src/features/scanner/engines/frameProcessor';
import { ScannedPage } from '../../src/features/scanner/types/scanner';
import { AutoCaptureState } from '../../src/features/scanner/engines/autoCaptureEngine';
import { DetectionResult } from '../../src/features/scanner/engines/detectionEngine';

const { width, height } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CameraScreen() {
  const router = useRouter();
  const { session, startSession, flashMode, setFlashMode, addPage } = useScannerStore();
  const cameraRef = useRef<CameraViewRef>(null);

  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [scanType, setScanType] = useState('Document');
  const [isHD, setIsHD] = useState(true);
  const [isAutoSnap, setIsAutoSnap] = useState(true);
  const [captureState, setCaptureState] = useState<AutoCaptureState>('SCANNING');

  // Reanimated Shared Values for UI
  const tlX = useSharedValue(0); const tlY = useSharedValue(0);
  const trX = useSharedValue(0); const trY = useSharedValue(0);
  const brX = useSharedValue(0); const brY = useSharedValue(0);
  const blX = useSharedValue(0); const blY = useSharedValue(0);
  const confidence = useSharedValue(0);
  const snapProgress = useSharedValue(0);

  useEffect(() => {
    if (!session) startSession();
  }, [session]);

  const handleCapture = useCallback(async (detection?: DetectionResult) => {
    if (!cameraRef.current || captureState === 'CAPTURING') return;
    
    setCaptureState('CAPTURING');
    
    try {
      const photo = await cameraRef.current.takePhoto();
      if (!photo) throw new Error('Capture failed');

      // Bake EXIF orientation so Skia (and math below) works with the true upright pixels
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`,
        [], 
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      const bakedWidth = manipResult.width;
      const bakedHeight = manipResult.height;

      let finalQuad = {
        topLeft: { x: 0, y: 0 },
        topRight: { x: bakedWidth, y: 0 },
        bottomRight: { x: bakedWidth, y: bakedHeight },
        bottomLeft: { x: 0, y: bakedHeight }
      };

      if (detection && detection.frameWidth && detection.frameHeight && detection.quad) {
        // Calculate scale factors from frame to baked photo
        const isFrameLandscape = detection.frameWidth > detection.frameHeight;
        const isPhotoLandscape = bakedWidth > bakedHeight;
        
        let scaleX = bakedWidth / detection.frameWidth;
        let scaleY = bakedHeight / detection.frameHeight;

        // If orientation is mismatched, swap scales
        if (isFrameLandscape !== isPhotoLandscape) {
          scaleX = bakedWidth / detection.frameHeight;
          scaleY = bakedHeight / detection.frameWidth;
          
          finalQuad = {
            topLeft: { x: detection.quad.topLeft.y * scaleX, y: detection.quad.topLeft.x * scaleY },
            topRight: { x: detection.quad.topRight.y * scaleX, y: detection.quad.topRight.x * scaleY },
            bottomRight: { x: detection.quad.bottomRight.y * scaleX, y: detection.quad.bottomRight.x * scaleY },
            bottomLeft: { x: detection.quad.bottomLeft.y * scaleX, y: detection.quad.bottomLeft.x * scaleY }
          };
        } else {
          finalQuad = {
            topLeft: { x: detection.quad.topLeft.x * scaleX, y: detection.quad.topLeft.y * scaleY },
            topRight: { x: detection.quad.topRight.x * scaleX, y: detection.quad.topRight.y * scaleY },
            bottomRight: { x: detection.quad.bottomRight.x * scaleX, y: detection.quad.bottomRight.y * scaleY },
            bottomLeft: { x: detection.quad.bottomLeft.x * scaleX, y: detection.quad.bottomLeft.y * scaleY }
          };
        }
      }

      const page: ScannedPage = {
        id: Date.now().toString(),
        rawUri: manipResult.uri,
        croppedUri: manipResult.uri,
        enhancedUri: manipResult.uri,
        quad: finalQuad,
        enhancementMode: 'auto',
        capturedAt: Date.now()
      };

      addPage(page);
      
      if (mode === 'single') {
        router.push({ 
          pathname: '/scanner/adjust', 
          params: { 
            pageId: page.id,
            photoUri: page.rawUri.startsWith('file://') ? page.rawUri : `file://${page.rawUri}`,
            photoWidth: bakedWidth,
            photoHeight: bakedHeight,
            detectedQuad: JSON.stringify(page.quad)
          } 
        });
      } else {
        setCaptureState('SCANNING');
      }
    } catch (e) {
      console.error('[Scanner] Capture error:', e);
      setCaptureState('SCANNING');
    }
  }, [cameraRef, captureState, mode, addPage, router]);

  const onDetection = useCallback((result: DetectionResult) => {
    handleCapture(result);
  }, [handleCapture]);

  // Safely update Reanimated SharedValues from the JS thread.
  // The frame processor (running on Worklets-Core thread) will call this.
  const updateUI = useCallback((corners: any | null, conf: number, shouldSnap: boolean) => {
    if (corners) {
      tlX.value = corners.topLeft.x;
      tlY.value = corners.topLeft.y;
      trX.value = corners.topRight.x;
      trY.value = corners.topRight.y;
      brX.value = corners.bottomRight.x;
      brY.value = corners.bottomRight.y;
      blX.value = corners.bottomLeft.x;
      blY.value = corners.bottomLeft.y;
    } else {
      tlX.value = 0; tlY.value = 0;
      trX.value = 0; trY.value = 0;
      brX.value = 0; brY.value = 0;
      blX.value = 0; blY.value = 0;
    }
    
    confidence.value = conf;

    if (shouldSnap) {
      snapProgress.value = withTiming(1, { duration: 800 }, () => {
        snapProgress.value = 0;
      });
    } else if (conf === 0) {
      snapProgress.value = 0;
    }
  }, [tlX, tlY, trX, trY, brX, brY, blX, blY, confidence, snapProgress]);

  // Create the highly isolated frame processor
  const frameProcessor = useDocumentFrameProcessor(
    onDetection, 
    isAutoSnap, 
    updateUI
  );

  const arcAnimatedProps = useAnimatedProps(() => {
    'worklet';
    return {
      strokeDashoffset: 188.4 * (1 - snapProgress.value),
    };
  }, [snapProgress]);

  const toggleFlash = useCallback(() => {
    const modes: ('off' | 'on' | 'auto')[] = ['off', 'on', 'auto'];
    const nextIndex = (modes.indexOf(flashMode) + 1) % modes.length;
    setFlashMode(modes[nextIndex]!);
  }, [flashMode, setFlashMode]);

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0]!;
      
      // Also bake orientation for gallery imports
      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      const page: ScannedPage = {
        id: Date.now().toString(),
        rawUri: manipResult.uri,
        croppedUri: manipResult.uri,
        enhancedUri: manipResult.uri,
        quad: {
          topLeft: { x: 0, y: 0 },
          topRight: { x: manipResult.width, y: 0 },
          bottomRight: { x: manipResult.width, y: manipResult.height },
          bottomLeft: { x: 0, y: manipResult.height }
        },
        enhancementMode: 'auto',
        capturedAt: Date.now()
      };
      addPage(page);
      router.push({ 
        pathname: '/scanner/adjust', 
        params: { 
          pageId: page.id,
          photoUri: page.rawUri,
          photoWidth: manipResult.width,
          photoHeight: manipResult.height,
          detectedQuad: JSON.stringify(page.quad)
        } 
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <CameraView 
        ref={cameraRef} 
        frameProcessor={frameProcessor} 
        flashMode={flashMode}
        isActive={true} // Must stay true for capture
      />

      <SafeAreaView style={styles.header} pointerEvents="box-none">
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.topIcon} onPress={toggleFlash}>
            <Zap size={24} color={flashMode !== 'off' ? '#FFD60A' : '#FFFFFF'} fill={flashMode === 'on' ? '#FFD60A' : 'transparent'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.autoSnapPill} onPress={() => setIsAutoSnap(!isAutoSnap)}>
            <View style={[styles.autoSnapDot, { backgroundColor: isAutoSnap ? '#3BA9FF' : '#FF3B30' }]} />
            <Text style={styles.autoSnapText}>{isAutoSnap ? 'AUTO ON' : 'AUTO OFF'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.topIcon} onPress={() => setIsHD(!isHD)}>
            <View style={[styles.hdBadge, { borderColor: isHD ? '#3BA9FF' : '#FFFFFF' }]}>
              <Text style={[styles.hdText, { color: isHD ? '#3BA9FF' : '#FFFFFF' }]}>HD</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <EdgeOverlay 
        tlX={tlX} tlY={tlY} trX={trX} trY={trY} 
        brX={brX} brY={brY} blX={blX} blY={blY}
        confidence={confidence}
        width={width}
        height={height}
        state={captureState}
      />

      <View style={styles.bottomControls} pointerEvents="box-none">
        <View style={styles.scanTypeSelector}>
          {['Document', 'ID Card', 'Book'].map(t => (
            <TouchableOpacity key={t} onPress={() => setScanType(t)} style={styles.typeChip}>
              <Text style={[styles.typeText, scanType === t && styles.typeTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.captureBar}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
            <X size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.shutterContainer}>
            <Pressable 
              style={({ pressed }) => [
                styles.shutterOuter,
                pressed && { opacity: 0.7 }
              ]} 
              onPress={() => handleCapture()}
              hitSlop={20}
            >
              <View style={[styles.shutterInner, captureState === 'CAPTURING' && styles.shutterInnerActive]} />
            </Pressable>
            
            {isAutoSnap && (
              <Svg width={90} height={90} style={styles.arcSvg} pointerEvents="none">
                <AnimatedCircle
                  cx="45" cy="45" r="30"
                  stroke="#3BA9FF"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="188.4"
                  animatedProps={arcAnimatedProps}
                  strokeLinecap="round"
                />
              </Svg>
            )}
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleGallery}>
            <ImageIcon size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  topIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  autoSnapPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 8 },
  autoSnapDot: { width: 8, height: 8, borderRadius: 4 },
  autoSnapText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  hdBadge: { borderWidth: 1.5, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  hdText: { fontSize: 12, fontWeight: '900' },
  bottomControls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 100 },
  scanTypeSelector: { flexDirection: 'row', gap: 16, marginBottom: 30 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 4 },
  typeText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
  typeTextActive: { color: '#FFFFFF' },
  captureBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 40 },
  actionBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  shutterContainer: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  shutterOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  shutterInnerActive: { backgroundColor: '#FFFFFF' },
  arcSvg: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
});

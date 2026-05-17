import React, { useState, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Info, Check, RotateCcw, Maximize, X } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';

import { 
  ScannerColors, 
  ScannerLayout, 
  ScannerTypography 
} from '../../src/features/scanner/constants';
import { CropCanvas } from '../../src/features/scanner/components/CropCanvas';
import { ProcessingOverlay } from '../../src/features/scanner/components/ProcessingOverlay';
import { applyPerspectiveCorrection } from '../../src/features/scanner/engines/perspectiveEngine';
import { useScannerStore } from '../../src/features/scanner/store/useScannerStore';
import { DocumentQuad } from '../../src/features/scanner/types/scanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AdjustScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setProcessing, isProcessing } = useScannerStore();
  
  const photoUri = params.photoUri as string;
  const photoWidth = parseInt(params.photoWidth as string);
  const photoHeight = parseInt(params.photoHeight as string);
  const initialQuad = useMemo(() => JSON.parse(params.detectedQuad as string) as DocumentQuad, [params.detectedQuad]);

  const [quad, setQuad] = useState<DocumentQuad>(initialQuad);
  const [rotation, setRotation] = useState(0);
  const [quality, setQuality] = useState<'standard' | 'high' | 'archival'>('high');

  const handleApply = async () => {
    setProcessing(true);
    try {
      const correctedUri = await applyPerspectiveCorrection(photoUri, {
        quad,
        outputWidth: 0, // Auto
        outputHeight: 0,
        qualityPreset: quality,
      });

      setProcessing(false);
      router.push({
        pathname: '/scanner/enhance',
        params: { 
          correctedUri,
          originalUri: photoUri 
        }
      });
    } catch (error) {
      setProcessing(false);
      console.error('Perspective correction failed', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crop & Straighten</Text>
        <TouchableOpacity onPress={handleApply} style={styles.headerBtn}>
          <Check size={24} color={ScannerColors.accent} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.canvasArea}>
        <CropCanvas 
          imageUri={photoUri}
          imageWidth={photoWidth}
          imageHeight={photoHeight}
          quad={quad}
          onQuadChange={setQuad}
        />
      </View>

      <View style={styles.bottomSheet}>
        {/* Quality Selector */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Quality</Text>
          <View style={styles.pillContainer}>
            {['standard', 'high', 'archival'].map((q) => (
              <TouchableOpacity 
                key={q} 
                onPress={() => setQuality(q as any)}
                style={[styles.pill, quality === q && styles.pillActive]}
              >
                <Text style={[styles.pillText, quality === q && styles.pillTextActive]}>
                  {q.charAt(0).toUpperCase() + q.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Straighten Dial */}
        <View style={styles.straightenContainer}>
          <View style={styles.dialHeader}>
            <RotateCcw size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.dialLabel}>Straighten</Text>
            <Text style={styles.dialValue}>{rotation}°</Text>
          </View>
          <View style={styles.dialTrack}>
            {Array.from({ length: 21 }).map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dialTick, 
                  i === 10 && styles.dialTickCenter,
                  Math.abs(i - 10) % 5 === 0 && styles.dialTickMajor
                ]} 
              />
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.mainApplyBtn}
          onPress={handleApply}
          activeOpacity={0.8}
        >
          <Text style={styles.mainApplyBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {isProcessing && (
        <ProcessingOverlay 
          message="Applying Perspective..." 
          subMessage="Straightening document with GPU" 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  canvasArea: { flex: 1, justifyContent: 'center', padding: 20 },
  bottomSheet: {
    backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 24,
  },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  pillContainer: { flexDirection: 'row', backgroundColor: '#222', borderRadius: 20, padding: 3, gap: 4 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18 },
  pillActive: { backgroundColor: ScannerColors.accent },
  pillText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#FFFFFF' },
  straightenContainer: { gap: 12 },
  dialHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dialLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', flex: 1 },
  dialValue: { color: ScannerColors.accent, fontSize: 14, fontWeight: '700' },
  dialTrack: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 20, paddingHorizontal: 10 },
  dialTick: { width: 1.5, height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 },
  dialTickMajor: { height: 12, backgroundColor: 'rgba(255,255,255,0.4)' },
  dialTickCenter: { height: 18, backgroundColor: ScannerColors.accent },
  mainApplyBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  mainApplyBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});

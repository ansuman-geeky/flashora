import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, X, ShieldCheck, AlertTriangle, Image as ImageIcon, Sparkles, Clock, Sun, Droplets, Contrast } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedGestureHandler
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

import {
  ScannerColors,
  ScannerLayout,
  ScannerTypography
} from '../../src/features/scanner/constants';
import { useScannerStore } from '../../src/features/scanner/store/useScannerStore';
import { applyEnhancement, EnhancementMode } from '../../src/features/scanner/engines/enhancementEngine';
import { QualityEngine, QualityReport } from '../../src/features/scanner/engines/qualityEngine';
import { ProcessingOverlay } from '../../src/features/scanner/components/ProcessingOverlay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ENHANCEMENT_MODES: { id: EnhancementMode; label: string; Icon: any }[] = [
  { id: 'original', label: 'Original', Icon: ImageIcon },
  { id: 'auto', label: 'Auto', Icon: Sparkles },
  { id: 'vintage', label: 'Vintage', Icon: Clock },
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'grey', label: 'Grey', Icon: Droplets },
  { id: 'bw', label: 'B&W', Icon: Contrast },
];

export default function EnhanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addPage, setProcessing, isProcessing } = useScannerStore();

  const correctedUri = params.correctedUri as string;
  const originalUri = params.originalUri as string;

  const [mode, setMode] = useState<EnhancementMode>('original');
  const [enhancedUri, setEnhancedUri] = useState<string>(correctedUri);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);

  const dividerPos = useSharedValue(SCREEN_WIDTH / 2);

  const runEnhancement = useCallback(async (selectedMode: EnhancementMode) => {
    setProcessing(true);
    try {
      const result = await applyEnhancement(correctedUri, selectedMode);
      setEnhancedUri(result);

      // Perform quality check
      const report = QualityEngine.analyze(0.8, 0.9, 0.7, true); // Placeholder values
      setQualityReport(report);
    } catch (error) {
      console.error('Enhancement failed', error);
    } finally {
      setProcessing(false);
    }
  }, [correctedUri]);

  useEffect(() => {
    runEnhancement(mode);
  }, [mode]);

  // Removed divider logic

  const handleDone = () => {
    const newPage = {
      id: Date.now().toString(),
      rawUri: originalUri,
      croppedUri: correctedUri,
      enhancedUri: enhancedUri,
      enhancementMode: mode,
      capturedAt: Date.now(),
    };

    addPage(newPage as any);
    router.push('/scanner/export');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter & Enhance</Text>
        <TouchableOpacity onPress={handleDone} style={styles.headerBtn}>
          <Check size={24} color={ScannerColors.accent} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.previewContainer}>
        {/* Full Screen Enhanced Image */}
        <Image source={{ uri: enhancedUri }} style={styles.previewImage} resizeMode="contain" />

        {/* Quality Badge */}
        {qualityReport && (
          <View style={[styles.qualityBadge, { backgroundColor: qualityReport.isAcceptable ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
            {qualityReport.isAcceptable ? <ShieldCheck size={14} color="#22C55E" /> : <AlertTriangle size={14} color="#EF4444" />}
            <Text style={[styles.qualityText, { color: qualityReport.isAcceptable ? '#22C55E' : '#EF4444' }]}>
              {qualityReport.overallScore}% Quality
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeScroll}>
          {ENHANCEMENT_MODES.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setMode(m.id)}
              style={[styles.modeChip, mode === m.id && styles.modeChipActive]}
            >
              <m.Icon size={22} color={mode === m.id ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} />
              <Text style={[styles.modeLabel, mode === m.id && styles.modeLabelActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.recommendationText}>
            {qualityReport?.recommendation || 'Processing enhancement...'}
          </Text>
          <TouchableOpacity style={styles.mainDoneBtn} onPress={handleDone}>
            <Text style={styles.mainDoneBtnText}>Save Page</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isProcessing && (
        <ProcessingOverlay message="Enhancing Document..." subMessage="Removing shadows & optimizing text" />
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
  previewContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  qualityBadge: {
    position: 'absolute', top: 20, right: 20, flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  qualityText: { fontSize: 12, fontWeight: '700' },
  controls: { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  modeScroll: { padding: 24, gap: 12 },
  modeChip: {
    alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 16, backgroundColor: '#222', minWidth: 80
  },
  modeChipActive: { backgroundColor: ScannerColors.accent },
  modeLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  modeLabelActive: { color: '#FFFFFF' },
  footer: { paddingHorizontal: 24, gap: 16 },
  recommendationText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
  mainDoneBtn: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  mainDoneBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});

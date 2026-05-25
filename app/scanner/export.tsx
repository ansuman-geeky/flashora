import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Plus, Pencil, Save, Share2, FileSearch, CheckCircle2 } from 'lucide-react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { 
  ScannerColors, 
  ScannerLayout, 
  ScannerTypography 
} from '../../src/features/scanner/constants';
import { ExportFormatCard, ExportFormatId } from '../../src/features/scanner/components/ExportFormatCard';
import { SuccessToast } from '../../src/features/scanner/components/SuccessToast';
import { ProcessingOverlay } from '../../src/features/scanner/components/ProcessingOverlay';
import { PremiumUpgradeSheet } from '../../src/features/scanner/components/PremiumUpgradeSheet';
import { useScannerStore } from '../../src/features/scanner/store/useScannerStore';
import { ScannedPage } from '../../src/features/scanner/types/scanner';
import { exportToPdf } from '../../src/features/scanner/services/pdfExportService';
import { OCRService } from '../../src/features/scanner/services/ocrService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExportScreen() {
  const router = useRouter();
  const { session, reorderPages, clearSession } = useScannerStore();
  
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatId>('pdf');
  const [fileName, setFileName] = useState(`Scan_${(new Date().toISOString().split('T')[0] ?? '').replace(/-/g, '_')}`);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPremiumSheet, setShowPremiumSheet] = useState(false);
  
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [searchable, setSearchable] = useState(true);

  const pages = session?.pages || [];

  // Automatically start OCR when entering export screen if multiple pages
  useEffect(() => {
    if (pages.length > 0 && ocrStatus === 'idle') {
      runOCR();
    }
  }, [pages]);

  const runOCR = async () => {
    setOcrStatus('processing');
    try {
      // Process first 3 pages as a demo or all if premium
      for (const page of pages.slice(0, 3)) {
        await OCRService.recognize(page.enhancedUri);
      }
      setOcrStatus('completed');
    } catch (e) {
      setOcrStatus('idle');
    }
  };

  const handleSave = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    try {
      if (selectedFormat === 'pdf') {
        const uri = await exportToPdf(pages, { 
          fileName, 
          format: 'pdf', 
          quality: 'high',
          searchable: searchable && ocrStatus === 'completed'
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Gallery permission is required to save images.');
          return;
        }
        for (const page of pages) {
          await MediaLibrary.saveToLibraryAsync(page.enhancedUri);
        }
        setShowToast(true);
      }
    } catch (error) {
      console.error('Save failed', error);
      Alert.alert('Error', 'Failed to save document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPageItem = useCallback(({ item, drag, isActive, getIndex }: RenderItemParams<ScannedPage>) => {
    const index = getIndex();
    return (
      <TouchableOpacity 
        style={[styles.pageThumb, isActive && styles.pageThumbActive]}
        onLongPress={drag}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.enhancedUri }} style={styles.thumbImage} />
        <View style={styles.badgeCount}>
          <Text style={styles.badgeText}>{typeof index === 'number' ? index + 1 : ''}</Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Export</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page Strip */}
        <View style={styles.pageStripContainer}>
          <DraggableFlatList
            data={pages}
            onDragEnd={({ from, to }) => reorderPages(from, to)}
            keyExtractor={(item) => item.id}
            renderItem={renderPageItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pageStripContent}
            ListFooterComponent={
              <TouchableOpacity style={styles.addPageBtn} onPress={() => router.push('/scanner/camera')}>
                <Plus size={24} color={ScannerColors.accent} />
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            }
          />
        </View>

        {/* OCR Status Banner */}
        {ocrStatus !== 'idle' && (
          <Animated.View entering={FadeIn} style={[styles.ocrBanner, ocrStatus === 'completed' && styles.ocrBannerDone]}>
            {ocrStatus === 'processing' ? (
              <FileSearch size={16} color={ScannerColors.accent} />
            ) : (
              <CheckCircle2 size={16} color="#22C55E" />
            )}
            <Text style={[styles.ocrText, ocrStatus === 'completed' && styles.ocrTextDone]}>
              {ocrStatus === 'processing' ? 'Running OCR... Making PDF searchable' : 'Text recognition complete! PDF is now searchable.'}
            </Text>
          </Animated.View>
        )}

        {/* File Details */}
        <View style={styles.section}>
          <View style={styles.fileNameRow}>
            {isEditingName ? (
              <TextInput 
                style={styles.fileNameInput}
                value={fileName}
                onChangeText={setFileName}
                onBlur={() => setIsEditingName(false)}
                autoFocus
              />
            ) : (
              <TouchableOpacity style={styles.fileNameDisplay} onPress={() => setIsEditingName(true)}>
                <Text style={styles.fileNameVal}>{fileName}</Text>
                <Pencil size={14} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            )}
            <Text style={styles.fileExt}>.{selectedFormat}</Text>
          </View>
        </View>

        {/* Format Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <View style={styles.formatGrid}>
            <ExportFormatCard 
              id="pdf" name="PDF document" description="Best for multi-page"
              isSelected={selectedFormat === 'pdf'} onSelect={setSelectedFormat}
            />
            <ExportFormatCard 
              id="image" name="JPEG images" description="Save to Gallery"
              isSelected={selectedFormat === 'image'} onSelect={setSelectedFormat}
            />
            <ExportFormatCard 
              id="docx" name="Word Doc" description="Editable text" isPremium
              isSelected={selectedFormat === 'docx'} onSelect={() => setShowPremiumSheet(true)}
            />
          </View>
        </View>

        {selectedFormat === 'pdf' && (
          <View style={styles.optionsSection}>
            <View style={styles.optionRow}>
              <View>
                <Text style={styles.optionTitle}>Searchable PDF</Text>
                <Text style={styles.optionSub}>Embeds OCR text layer</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setSearchable(!searchable)}
                style={[styles.toggle, searchable && styles.toggleActive]}
              >
                <View style={[styles.toggleCircle, searchable && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleSave}>
          <Share2 size={20} color="#000" />
          <Text style={styles.shareBtnText}>Share Document</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Locally</Text>
        </TouchableOpacity>
      </View>

      <SuccessToast visible={showToast} message="Document saved successfully!" onDismiss={() => setShowToast(false)} />
      <PremiumUpgradeSheet isVisible={showPremiumSheet} onClose={() => setShowPremiumSheet(false)} onUpgrade={() => setShowPremiumSheet(false)} />
      {isProcessing && <ProcessingOverlay message="Exporting..." subMessage="Generating high-quality document" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 140 },
  pageStripContainer: { height: 160, marginVertical: 20 },
  pageStripContent: { paddingHorizontal: 20, gap: 12 },
  pageThumb: { width: 100, height: 140, borderRadius: 12, overflow: 'hidden', backgroundColor: '#111', borderWidth: 1, borderColor: '#222' },
  pageThumbActive: { borderColor: ScannerColors.accent, transform: [{ scale: 1.05 }] },
  thumbImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  badgeCount: { position: 'absolute', top: 8, left: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  addPageBtn: { width: 100, height: 140, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)' },
  addText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  ocrBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 24, padding: 12, borderRadius: 12, backgroundColor: 'rgba(59, 169, 255, 0.08)', gap: 10 },
  ocrBannerDone: { backgroundColor: 'rgba(34, 197, 94, 0.08)' },
  ocrText: { color: ScannerColors.accent, fontSize: 12, fontWeight: '600', flex: 1 },
  ocrTextDone: { color: '#22C55E' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  fileNameRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 16, borderRadius: 16, gap: 10 },
  fileNameDisplay: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fileNameVal: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  fileNameInput: { flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '600', padding: 0 },
  fileExt: { color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '600' },
  formatGrid: { gap: 12 },
  optionsSection: { paddingHorizontal: 20 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: 16, borderRadius: 16 },
  optionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  optionSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#333', padding: 2 },
  toggleActive: { backgroundColor: ScannerColors.accent },
  toggleCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
  toggleCircleActive: { transform: [{ translateX: 20 }] },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.8)', gap: 12 },
  shareBtn: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  shareBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  saveBtn: { backgroundColor: '#111', borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: '#222' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

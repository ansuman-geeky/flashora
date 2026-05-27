/**
 * ScannerExport — Save / Export / Share scanned documents
 *
 * Allows renaming, choosing format (PDF/JPG), saving, and sharing.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Save,
  Share2,
  FileText,
  Image as ImageIcon,
  Check,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useScannerHistory } from '../store/useScannerHistory';
import { saveToGeneralStorage } from '@features/pdf/services';
import * as MediaLibrary from 'expo-media-library';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { logEvent } from '@services/analytics';
import { useTheme } from '@hooks/useTheme';
import { Colors } from '@design-system/tokens';

type ExportFormat = 'pdf' | 'jpg';

export function ScannerExport() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const params = useLocalSearchParams<{ scanId: string }>();
  const scanId = params.scanId;

  const scan = useScannerHistory((s) => s.scans.find((sc) => sc.id === scanId));
  const renameScan = useScannerHistory((s) => s.renameScan);

  const [fileName, setFileName] = useState(scan?.name ?? 'Untitled Scan');
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [isSaving, setIsSaving] = useState(false);

  const { showSnackbar } = useSnackbar();

  const handleSave = useCallback(async () => {
    if (!scan) return;
    setIsSaving(true);

    try {
      // Rename in store
      if (fileName !== scan.name) {
        renameScan(scan.id, fileName);
      }

      if (format === 'pdf' && scan.pdfUri) {
        await saveToGeneralStorage(scan.pdfUri, `${fileName}.pdf`);
        showSnackbar('PDF saved successfully', 'success');
      } else if (format === 'jpg' && scan.imageUris.length > 0) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          showSnackbar('Permission to access gallery was denied', 'error');
          setIsSaving(false);
          return;
        }

        // Save first page as JPG to gallery for simplicity, 
        // or loop if they want all pages (we save first page here)
        await MediaLibrary.saveToLibraryAsync(scan.imageUris[0] as string);
        showSnackbar('Image downloaded', 'success');
      }
    } catch (error) {
      console.warn('Save failed:', error);
      showSnackbar('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [scan, fileName, renameScan, format, showSnackbar]);

  const handleShare = useCallback(async () => {
    if (!scan) return;

    try {
      const uri = format === 'pdf' && scan.pdfUri ? scan.pdfUri : scan.imageUris[0];
      if (!uri) {
        showSnackbar('No file to share.', 'error');
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        await Share.share({ message: `Check out my scanned document: ${fileName}` });
      }
      showSnackbar('Shared successfully', 'success');
    } catch (error) {
      console.warn('Share failed:', error);
      showSnackbar('Something went wrong. Please try again.', 'error');
    }
  }, [scan, format, fileName, showSnackbar]);

  if (!scan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
        <Text style={[styles.errorText, { color: colors.onSurfaceVariant }]}>Scan not found.</Text>
      </SafeAreaView>
    );
  }

  const bgColor = isDark ? '#0D0F14' : colors.bg;
  const surfaceColor = isDark ? '#161A23' : colors.surface;
  const borderColor = isDark ? '#252B38' : colors.outlineVariant;
  const textPrimary = isDark ? '#F1F5F9' : colors.onSurface;
  const textSecondary = isDark ? '#94A3B8' : colors.onSurfaceVariant;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <ArrowLeft size={20} color={Colors.primary} />
          <Text style={[styles.backText, { color: Colors.primary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Export</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview */}
        {scan.thumbnailUri && (
          <View style={[styles.previewCard, { backgroundColor: surfaceColor, borderColor }]}>
            <Image source={{ uri: scan.thumbnailUri }} style={styles.previewImage} />
            <Text style={[styles.pageCount, { color: textSecondary }]}>
              {scan.imageUris.length} page{scan.imageUris.length !== 1 ? 's' : ''} scanned
            </Text>
          </View>
        )}

        {/* File Name Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>FILE NAME</Text>
          <View style={[styles.inputContainer, { backgroundColor: surfaceColor, borderColor }]}>
            <TextInput
              style={[styles.input, { color: textPrimary }]}
              value={fileName}
              onChangeText={setFileName}
              placeholder="Enter file name"
              placeholderTextColor={textSecondary}
            />
          </View>
        </View>

        {/* Format Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>EXPORT FORMAT</Text>

          {/* PDF Option */}
          <Pressable
            style={[
              styles.formatCard,
              {
                backgroundColor: format === 'pdf'
                  ? 'rgba(14, 165, 233, 0.08)'
                  : surfaceColor,
                borderColor: format === 'pdf'
                  ? 'rgba(14, 165, 233, 0.5)'
                  : borderColor,
              },
            ]}
            onPress={() => setFormat('pdf')}
          >
            <View style={[styles.formatIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <FileText size={18} color="#EF4444" />
            </View>
            <View style={styles.formatInfo}>
              <Text style={[styles.formatName, { color: textPrimary }]}>PDF Document</Text>
              <Text style={[styles.formatDesc, { color: textSecondary }]}>
                Multi-page, high quality
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: format === 'pdf' ? Colors.primary : borderColor,
                  backgroundColor: format === 'pdf' ? Colors.primary : 'transparent',
                },
              ]}
            >
              {format === 'pdf' && <Check size={12} color="#FFF" />}
            </View>
          </Pressable>

          {/* JPG Option */}
          <Pressable
            style={[
              styles.formatCard,
              {
                backgroundColor: format === 'jpg'
                  ? 'rgba(14, 165, 233, 0.08)'
                  : surfaceColor,
                borderColor: format === 'jpg'
                  ? 'rgba(14, 165, 233, 0.5)'
                  : borderColor,
              },
            ]}
            onPress={() => setFormat('jpg')}
          >
            <View style={[styles.formatIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <ImageIcon size={18} color="#F59E0B" />
            </View>
            <View style={styles.formatInfo}>
              <Text style={[styles.formatName, { color: textPrimary }]}>JPEG Images</Text>
              <Text style={[styles.formatDesc, { color: textSecondary }]}>
                Individual page images
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: format === 'jpg' ? Colors.primary : borderColor,
                  backgroundColor: format === 'jpg' ? Colors.primary : 'transparent',
                },
              ]}
            >
              {format === 'jpg' && <Check size={12} color="#FFF" />}
            </View>
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: Colors.primary }]}
            onPress={handleSave}
            disabled={isSaving}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Save size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Save to Device</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.secondaryBtn, { backgroundColor: surfaceColor, borderColor }]}
            onPress={handleShare}
            android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
          >
            <Share2 size={18} color={textSecondary} style={{ marginRight: 8 }} />
            <Text style={[styles.secondaryBtnText, { color: textSecondary }]}>Share</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  backText: {
    fontSize: 14,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 18,
    paddingBottom: 100,
  },
  previewCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  pageCount: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    fontSize: 14,
    fontWeight: '500',
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    marginBottom: 8,
    gap: 12,
  },
  formatIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatInfo: {
    flex: 1,
  },
  formatName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  formatDesc: {
    fontSize: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    gap: 10,
    marginTop: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

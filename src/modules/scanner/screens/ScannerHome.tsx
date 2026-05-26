/**
 * ScannerHome — Main Scanner tab screen
 *
 * Provides: Primary "Scan Document" CTA, "Import from Gallery" CTA,
 * and a "Recent Scans" list with thumbnails.
 * Supports dark/light mode via the app theme.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Share2,
  X,
} from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useScannerHistory, ScanItem } from '../store/useScannerHistory';
import { ScanItemCard } from '../components/ScanItemCard';
import { scanAndSave } from '../services/scannerService';
import { useTheme } from '@hooks/useTheme';
import { Colors } from '@design-system/tokens';

export function ScannerHome() {
  const scans = useScannerHistory((state) => state.scans);
  const removeScan = useScannerHistory((state) => state.removeScan);
  const renameScan = useScannerHistory((state) => state.renameScan);
  const { isDark, colors } = useTheme();
  const router = useRouter();

  const [selectedScan, setSelectedScan] = useState<ScanItem | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');

  const handleScanPress = useCallback(async () => {
    try {
      const result = await scanAndSave();
      if (result) {
        // Navigate to export screen after successful scan
        router.push({ pathname: '/scanner/export', params: { scanId: result.id } } as never);
      }
    } catch (e: any) {
      if (e?.message !== 'User canceled the scan' && e?.code !== 'USER_CANCELED') {
        Alert.alert('Scan Failed', 'Could not complete the scan. Please try again.');
      }
    }
  }, [router]);

  const handleGalleryPress = useCallback(async () => {
    try {
      const result = await scanAndSave();
      if (result) {
        router.push({ pathname: '/scanner/export', params: { scanId: result.id } } as never);
      }
    } catch (e: any) {
      if (e?.message !== 'User canceled the scan' && e?.code !== 'USER_CANCELED') {
        Alert.alert('Import Failed', 'Could not import from gallery. Please try again.');
      }
    }
  }, [router]);

  const handleItemPress = useCallback(
    (item: ScanItem) => {
      router.push({ pathname: '/scanner/export', params: { scanId: item.id } } as never);
    },
    [router]
  );

  const handleOptionsPress = useCallback((item: ScanItem) => {
    setSelectedScan(item);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedScan) return;
    Alert.alert(
      'Delete Scan',
      `Are you sure you want to delete "${selectedScan.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeScan(selectedScan.id);
            setSelectedScan(null);
          },
        },
      ]
    );
  }, [selectedScan, removeScan]);

  const handleRename = useCallback(() => {
    if (!selectedScan) return;
    setRenameText(selectedScan.name);
    setIsRenaming(true);
  }, [selectedScan]);

  const confirmRename = useCallback(() => {
    if (!selectedScan || !renameText.trim()) return;
    renameScan(selectedScan.id, renameText.trim());
    setIsRenaming(false);
    setSelectedScan(null);
  }, [selectedScan, renameText, renameScan]);

  const handleShare = useCallback(async () => {
    if (!selectedScan) return;
    const uri = selectedScan.pdfUri || selectedScan.imageUris[0];
    if (!uri) return;
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      }
    } catch (err) {
      console.warn('Share failed:', err);
    }
    setSelectedScan(null);
  }, [selectedScan]);

  const bgColor = isDark ? '#0D0F14' : colors.bg;
  const surfaceColor = isDark ? '#161A23' : colors.surface;
  const borderColor = isDark ? '#252B38' : colors.border;
  const textPrimary = isDark ? '#F1F5F9' : colors.textPrimary;
  const textSecondary = isDark ? '#94A3B8' : colors.textSecondary;
  const textTertiary = isDark ? '#64748B' : colors.textTertiary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Document Scanner</Text>
        <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
          Scan, crop, and save documents
        </Text>
      </View>

      {/* CTA Buttons */}
      <View style={styles.actionContainer}>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
          onPress={handleScanPress}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Camera size={22} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.primaryButtonText}>Scan Document</Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            {
              backgroundColor: isDark ? 'rgba(91, 95, 239, 0.08)' : 'rgba(91, 95, 239, 0.06)',
              borderColor: isDark ? 'rgba(91, 95, 239, 0.25)' : 'rgba(91, 95, 239, 0.2)',
            },
          ]}
          onPress={handleGalleryPress}
          android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
        >
          <ImageIcon size={20} color={Colors.primary} style={styles.btnIcon} />
          <Text style={[styles.secondaryButtonText, { color: Colors.primary }]}>
            Import from Gallery
          </Text>
        </Pressable>
      </View>

      {/* Recent Scans Section */}
      <View style={styles.historySection}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>Recent Scans</Text>
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ScanItemCard
              item={item}
              isDark={isDark}
              onPress={() => handleItemPress(item)}
              onOptionsPress={() => handleOptionsPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Camera size={48} color={textTertiary} />
              <Text style={[styles.emptyTitle, { color: textSecondary }]}>No scans yet</Text>
              <Text style={[styles.emptyText, { color: textTertiary }]}>
                Tap "Scan Document" to get started
              </Text>
            </View>
          }
        />
      </View>

      {/* Options Bottom Sheet (simplified inline modal) */}
      {selectedScan && !isRenaming && (
        <View style={[styles.overlay]}>
          <Pressable style={styles.overlayBg} onPress={() => setSelectedScan(null)} />
          <View style={[styles.bottomSheet, { backgroundColor: surfaceColor }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: borderColor }]}>
              <Text style={[styles.sheetTitle, { color: textPrimary }]} numberOfLines={1}>
                {selectedScan.name}
              </Text>
              <Pressable onPress={() => setSelectedScan(null)} hitSlop={10}>
                <X size={20} color={textSecondary} />
              </Pressable>
            </View>
            <Pressable style={styles.sheetOption} onPress={handleRename}>
              <Edit2 size={18} color={Colors.primary} />
              <Text style={[styles.sheetOptionText, { color: textPrimary }]}>Rename</Text>
            </Pressable>
            <Pressable style={styles.sheetOption} onPress={handleShare}>
              <Share2 size={18} color={Colors.primary} />
              <Text style={[styles.sheetOptionText, { color: textPrimary }]}>Share</Text>
            </Pressable>
            <Pressable style={styles.sheetOption} onPress={handleDelete}>
              <Trash2 size={18} color={Colors.error} />
              <Text style={[styles.sheetOptionText, { color: Colors.error }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Rename Dialog */}
      {isRenaming && (
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBg} onPress={() => setIsRenaming(false)} />
          <View style={[styles.renameDialog, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.renameTitle, { color: textPrimary }]}>Rename Scan</Text>
            <TextInput
              style={[
                styles.renameInput,
                { color: textPrimary, borderColor, backgroundColor: bgColor },
              ]}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.renameActions}>
              <Pressable
                style={[styles.renameBtn, { backgroundColor: borderColor }]}
                onPress={() => setIsRenaming(false)}
              >
                <Text style={[styles.renameBtnText, { color: textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.renameBtn, { backgroundColor: Colors.primary }]}
                onPress={confirmRename}
              >
                <Text style={styles.renameBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  btnIcon: {
    marginRight: 10,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Bottom sheet
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 0.5,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 14,
  },
  sheetOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  // Rename dialog
  renameDialog: {
    marginHorizontal: 30,
    marginBottom: 200,
    borderRadius: 16,
    padding: 20,
  },
  renameTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  renameInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  renameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  renameBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  renameBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

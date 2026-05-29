/**
 * ScanItemCard — Displays a single scan item in the history list
 *
 * Material 3 styled card with thumbnail, metadata, and options button.
 * Supports dark/light mode.
 */

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MoreVertical, FileText } from 'lucide-react-native';
import { ScanItem } from '../store/useScannerHistory';
import { Colors } from '@design-system/tokens';

interface ScanItemCardProps {
  item: ScanItem;
  isDark?: boolean;
  onPress: () => void;
  onOptionsPress: () => void;
}

export function ScanItemCard({ item, isDark = true, onPress, onOptionsPress }: ScanItemCardProps) {
  const dateStr = new Date(item.date).toLocaleDateString();
  const sizeStr =
    item.size > 1024 * 1024
      ? (item.size / 1024 / 1024).toFixed(2) + ' MB'
      : (item.size / 1024).toFixed(1) + ' KB';
  const pageCount = item.imageUris.length;

  const surfaceColor = isDark ? '#161A23' : '#FFFFFF';
  const borderColor = isDark ? '#252B38' : '#E5E7EB';
  const thumbBg = isDark ? '#2a2a2a' : '#F3F4F6';
  const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';

  return (
    <Pressable
      style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
      onPress={onPress}
      android_ripple={{ color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
    >
      <View style={[styles.thumbnailContainer, { backgroundColor: thumbBg }]}>
        {item.thumbnailUri ? (
          <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <FileText size={24} color={Colors.primary} />
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.meta, { color: textSecondary }]}>
          {dateStr} • {sizeStr} • {pageCount} page{pageCount !== 1 ? 's' : ''}
        </Text>
      </View>
      <Pressable
        style={styles.optionsButton}
        onPress={onOptionsPress}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="More options"
      >
        <MoreVertical size={20} color={textSecondary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 0.5,
  },
  thumbnailContainer: {
    width: 48,
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
  },
  optionsButton: {
    padding: 8,
  },
});

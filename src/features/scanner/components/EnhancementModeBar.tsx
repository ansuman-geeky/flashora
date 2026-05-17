import React from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View 
} from 'react-native';
import { EnhancementMode } from '../types/scanner';
import { ScannerColors, ScannerTypography } from '../constants';

interface EnhancementModeBarProps {
  currentMode: EnhancementMode;
  onModeChange: (mode: EnhancementMode) => void;
}

const MODES: { id: EnhancementMode; label: string }[] = [
  { id: 'auto', label: 'auto' },
  { id: 'bw', label: 'b&w' },
  { id: 'grayscale', label: 'grayscale' },
  { id: 'photo', label: 'photo' },
  { id: 'whiteboard', label: 'whiteboard' },
];

export function EnhancementModeBar({ currentMode, onModeChange }: EnhancementModeBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>enhancement mode</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.pill,
                isActive ? styles.pillActive : styles.pillInactive
              ]}
              onPress={() => onModeChange(mode.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pillText,
                isActive ? styles.textActive : styles.textInactive
              ]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    marginBottom: 14,
  },
  label: {
    ...ScannerTypography.sectionLabel,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 8,
    paddingBottom: 4,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 0.5,
    minWidth: 60,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: 'rgba(14, 165, 233, 0.5)',
  },
  pillInactive: {
    backgroundColor: ScannerColors.bgCard,
    borderColor: ScannerColors.border,
  },
  pillText: {
    fontSize: 12,
  },
  textActive: {
    color: ScannerColors.accent,
    fontWeight: '500',
  },
  textInactive: {
    color: ScannerColors.textSecondary,
  },
});

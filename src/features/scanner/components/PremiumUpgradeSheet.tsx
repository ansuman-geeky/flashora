import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { ScannerColors, ScannerLayout } from '../constants';

interface PremiumUpgradeSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title?: string;
  description?: string;
}

export function PremiumUpgradeSheet({
  isVisible,
  onClose,
  onUpgrade,
  title = 'unlock word doc export',
  description = 'Save time and edit your scans directly in Word with Flashora Premium.'
}: PremiumUpgradeSheetProps) {
  const snapPoints = useMemo(() => ['45%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  if (!isVisible) return null;

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.badgeContainer}>
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <TouchableOpacity 
          style={styles.upgradeButton} 
          activeOpacity={0.8}
          onPress={onUpgrade}
        >
          <Text style={styles.upgradeText}>upgrade to pro</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dismissButton} 
          onPress={onClose}
        >
          <Text style={styles.dismissText}>maybe later</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: ScannerColors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  indicator: {
    backgroundColor: ScannerColors.border,
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  badgeContainer: {
    marginBottom: 16,
  },
  proBadge: {
    backgroundColor: ScannerColors.premiumBg,
    borderColor: ScannerColors.premiumBorder,
    borderWidth: 0.5,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  proText: {
    color: ScannerColors.premiumText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: ScannerColors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: ScannerColors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: ScannerColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    paddingVertical: 12,
  },
  dismissText: {
    fontSize: 12,
    color: ScannerColors.textTertiary,
    textAlign: 'center',
  },
});

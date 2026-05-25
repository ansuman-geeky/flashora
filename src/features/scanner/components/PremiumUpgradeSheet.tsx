import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { ScannerColors, ScannerLayout } from '../constants';
import { usePremiumStore } from '../../../store/usePremiumStore';
import { logEvent } from '../../../services/analytics';

interface PremiumUpgradeSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
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
  const activateSubscription = usePremiumStore((s) => s.activateSubscription);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    logEvent('premium_click', { plan: 'yearly' });
    
    try {
      // Simulate App Store / Play Store API request
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      activateSubscription('yearly', expiryDate.toISOString());
      logEvent('premium_upgrade', { 
        plan: 'yearly', 
        revenue_inr: 799 
      });
      
      setLoading(false);
      Alert.alert(
        'Success!',
        'Thank you for upgrading to Flashora Premium! You now have unlimited access to all tools.',
        [{ text: 'Awesome', onPress: () => {
          onClose();
          if (onUpgrade) onUpgrade();
        }}]
      );
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Simulated purchase failed.');
    }
  };

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
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color={ScannerColors.accent} />
            <Text style={styles.loaderText}>Processing payment...</Text>
          </View>
        )}
        
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
          onPress={handleUpgrade}
          disabled={loading}
        >
          <Text style={styles.upgradeText}>upgrade to pro</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dismissButton} 
          onPress={onClose}
          disabled={loading}
        >
          <Text style={styles.dismissText}>maybe later</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  loaderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
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

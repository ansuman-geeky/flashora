/**
 * Premium Tab Screen
 *
 * Upgrade screen with plan comparison and pricing.
 * Placeholder for full Step 11 implementation.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Check, Zap, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { Divider } from '@components/Divider';
import { DEFAULT_PRICING } from '@app-types/premium';
import { usePremiumStore } from '@store/usePremiumStore';
import { useTheme } from '@hooks/useTheme';
import { logEvent } from '@services/analytics';

const FREE_FEATURES = [
  '5 PDF operations/day',
  'Single file processing',
  'Standard compression',
  'Basic QR types',
  'Light/Dark theme only',
];

const PREMIUM_FEATURES = [
  'Unlimited PDF operations',
  'Batch processing (all tools)',
  'High-quality compression',
  'All QR types + custom colors',
  '3 Premium themes (Midnight, Sunset, Emerald)',
  'Ad-free experience',
];

export default function PremiumScreen() {
  const { colors } = useTheme();
  const isPremium = usePremiumStore((s) => s.tier === 'premium');
  const plan = usePremiumStore((s) => s.plan);
  const expiresAt = usePremiumStore((s) => s.expiresAt);
  const activateSubscription = usePremiumStore((s) => s.activateSubscription);
  const deactivateSubscription = usePremiumStore((s) => s.deactivateSubscription);
  
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (selectedPlan: 'monthly' | 'yearly') => {
    setLoading(true);
    logEvent('premium_click', { plan: selectedPlan });
    
    // Simulate App Store / Play Store API request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const expiryDate = new Date();
    if (selectedPlan === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    activateSubscription(selectedPlan, expiryDate.toISOString());
    logEvent('premium_upgrade', { 
      plan: selectedPlan, 
      revenue_inr: selectedPlan === 'yearly' ? 799 : 149 
    });
    
    setLoading(false);
    Alert.alert(
      'Success!',
      'Thank you for upgrading to Flashora Premium! You now have unlimited access to all tools.',
      [{ text: 'Awesome' }]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Premium?',
      'Are you sure you want to cancel your Premium subscription for testing purposes?',
      [
        { text: 'Keep Premium', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: () => {
            deactivateSubscription();
            Alert.alert('Subscription Cancelled', 'Your account has been reverted to the Free tier.');
          }
        }
      ]
    );
  };

  const formattedExpiry = expiresAt 
    ? new Date(expiresAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      {loading && (
        <View 
          className="absolute inset-0 z-50 bg-black/60 items-center justify-center"
          style={StyleSheet.absoluteFillObject}
        >
          <Card variant="elevated" className="p-3 items-center">
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text className="text-sm font-semibold text-onSurface dark:text-onSurface-dark mt-1">
              Processing Payment...
            </Text>
            <Text className="text-xs text-onSurfaceVariant mt-0.5">
              Connecting with Google Play Store
            </Text>
          </Card>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center pt-4 pb-3">
          <View className="w-[72px] h-[72px] rounded-full bg-primary-muted items-center justify-center mb-2">
            <Star size={36} color={Colors.primary} fill={Colors.primaryMuted} />
          </View>
          <Text className="text-2xl font-bold text-onSurface dark:text-onSurface-dark">
            {isPremium ? "You're Premium!" : 'Go Premium'}
          </Text>
          <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mt-0.5 text-center px-4">
            {isPremium
              ? 'Enjoy unlimited access to all tools and features.'
              : 'Unlock the full power of Flashora.'}
          </Text>
        </View>

        {/* Plan comparison */}
        <View className="px-2">
          {/* Active subscription card for premium users */}
          {isPremium ? (
            <Card variant="elevated" className="mb-3 p-2 border-emerald-500 border-2">
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center">
                  <Star size={20} color="#10B981" fill="#D1FAE5" />
                  <Text className="text-md font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                    Premium Active
                  </Text>
                </View>
                <Badge label={plan === 'yearly' ? 'YEARLY' : 'MONTHLY'} variant="success" size="sm" />
              </View>
              <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark">
                Expires on: <Text className="font-semibold text-onSurface dark:text-onSurface-dark">{formattedExpiry}</Text>
              </Text>
              <Divider spacing="sm" />
              <View className="flex-row gap-1">
                <Button
                  label="Restore Purchases"
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw size={14} color={Colors.primary} />}
                  onPress={() => Alert.alert('Restore Complete', 'All previous purchases have been successfully restored.')}
                  className="flex-1"
                />
                <Button
                  label="Cancel Subscription"
                  variant="outline"
                  size="sm"
                  leftIcon={<AlertTriangle size={14} color="#EF4444" />}
                  onPress={handleCancelSubscription}
                  className="flex-1"
                />
              </View>
            </Card>
          ) : (
            <>
              {/* Free tier */}
              <Card variant="flat" className="mb-2 p-2">
                <Text className="text-md font-semibold text-onSurface dark:text-onSurface-dark mb-1.5">
                  Free
                </Text>
                {FREE_FEATURES.map((feature) => (
                  <View key={feature} className="flex-row items-center mb-1">
                    <Check size={16} color={Colors.textTertiary} />
                    <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark ml-1">
                      {feature}
                    </Text>
                  </View>
                ))}
              </Card>

              {/* Premium tier */}
              <Card variant="elevated" className="mb-3 p-2 border-primary">
                <View className="flex-row items-center mb-1.5">
                  <Text className="text-md font-semibold text-onSurface dark:text-onSurface-dark">
                    Premium
                  </Text>
                  <Badge label="RECOMMENDED" variant="premium" size="sm" className="ml-1" />
                </View>
                {PREMIUM_FEATURES.map((feature) => (
                  <View key={feature} className="flex-row items-center mb-1">
                    <Check size={16} color={Colors.primary} />
                    <Text className="text-sm text-onSurface dark:text-onSurface-dark ml-1">
                      {feature}
                    </Text>
                  </View>
                ))}
              </Card>

              {/* Pricing buttons */}
              <View className="gap-1.5">
                <Button
                  label={`${DEFAULT_PRICING.yearly.label} — Save ${DEFAULT_PRICING.yearly.savingsPercent}%`}
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Zap size={20} color="#FFFFFF" />}
                  onPress={() => handleSubscribe('yearly')}
                />
                <Button
                  label={DEFAULT_PRICING.monthly.label}
                  variant="outline"
                  size="lg"
                  fullWidth
                  onPress={() => handleSubscribe('monthly')}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StyleSheet = {
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  } as const
};

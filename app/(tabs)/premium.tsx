/**
 * Premium Tab Screen
 *
 * Upgrade screen with plan comparison and pricing.
 * Placeholder for full Step 11 implementation.
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Check, Zap } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { DEFAULT_PRICING } from '@app-types/premium';
import { usePremiumStore } from '@store/usePremiumStore';
import { useTheme } from '@hooks/useTheme';

const FREE_FEATURES = [
  '5 PDF operations/day',
  'Single file processing',
  'Standard compression',
  'Basic QR types',
  'Light/Dark theme',
];

const PREMIUM_FEATURES = [
  'Unlimited PDF operations',
  'Batch processing (all tools)',
  'High-quality compression',
  'All QR types + custom colors',
  '5 Premium themes',
  'Ad-free experience',
];

export default function PremiumScreen() {
  const { colors } = useTheme();
  const isPremium = usePremiumStore((s) => s.tier === 'premium');

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center pt-4 pb-3">
          <View className="w-[72px] h-[72px] rounded-full bg-primary-muted items-center justify-center mb-2">
            <Star size={36} color={Colors.primary} fill={Colors.primaryMuted} />
          </View>
          <Text className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            {isPremium ? 'You\'re Premium!' : 'Go Premium'}
          </Text>
          <Text className="text-sm text-text-secondary dark:text-text-secondary-dark mt-0.5 text-center px-4">
            {isPremium
              ? 'Enjoy unlimited access to all tools and features.'
              : 'Unlock the full power of Flashora.'}
          </Text>
        </View>

        {/* Plan comparison */}
        <View className="px-2">
          {/* Free tier */}
          <Card variant="flat" className="mb-2 p-2">
            <Text className="text-md font-semibold text-text-primary dark:text-text-primary-dark mb-1.5">
              Free
            </Text>
            {FREE_FEATURES.map((feature) => (
              <View key={feature} className="flex-row items-center mb-1">
                <Check size={16} color={Colors.textTertiary} />
                <Text className="text-sm text-text-secondary dark:text-text-secondary-dark ml-1">
                  {feature}
                </Text>
              </View>
            ))}
          </Card>

          {/* Premium tier */}
          <Card variant="elevated" className="mb-3 p-2 border-primary">
            <View className="flex-row items-center mb-1.5">
              <Text className="text-md font-semibold text-text-primary dark:text-text-primary-dark">
                Premium
              </Text>
              <Badge label="RECOMMENDED" variant="premium" size="sm" className="ml-1" />
            </View>
            {PREMIUM_FEATURES.map((feature) => (
              <View key={feature} className="flex-row items-center mb-1">
                <Check size={16} color={Colors.primary} />
                <Text className="text-sm text-text-primary dark:text-text-primary-dark ml-1">
                  {feature}
                </Text>
              </View>
            ))}
          </Card>

          {/* Pricing buttons */}
          {!isPremium && (
            <View className="gap-1.5">
              <Button
                label={`${DEFAULT_PRICING.yearly.label} — Save ${DEFAULT_PRICING.yearly.savingsPercent}%`}
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Zap size={20} color="#FFFFFF" />}
                onPress={() => {
                  // Will be implemented in Step 11
                }}
              />
              <Button
                label={DEFAULT_PRICING.monthly.label}
                variant="outline"
                size="lg"
                fullWidth
                onPress={() => {
                  // Will be implemented in Step 11
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

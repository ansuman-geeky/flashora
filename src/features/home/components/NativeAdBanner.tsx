/**
 * NativeAdBanner — Placeholder for native banner ad on home screen
 *
 * Will be wired to react-native-google-mobile-ads in Step 12.
 * Shows a styled placeholder in development.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Megaphone } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import { useAds } from '@hooks/useAds';

export function NativeAdBanner() {
  const { shouldShowAds } = useAds();

  if (!shouldShowAds) return null;

  return (
    <View className="mx-2 mb-3">
      <View
        className="rounded-md border border-border dark:border-border-dark bg-surface-raised dark:bg-surface-dark-raised p-2 items-center"
        accessibilityLabel="Advertisement"
      >
        <View className="flex-row items-center">
          <Megaphone size={16} color={Colors.textTertiary} />
          <Text className="text-xs text-text-tertiary dark:text-text-secondary-dark ml-0.5">
            Ad · Sponsored
          </Text>
        </View>
        <View className="w-full h-[60px] rounded-sm bg-border-subtle dark:bg-border-dark mt-1 items-center justify-center">
          <Text className="text-xs text-text-tertiary">
            Native ad will render here
          </Text>
        </View>
      </View>
    </View>
  );
}

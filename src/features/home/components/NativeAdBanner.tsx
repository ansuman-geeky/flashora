import React from 'react';
import { View, Text } from 'react-native';
import { Megaphone } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import { useAds } from '@hooks/useAds';
import { useTheme } from '@hooks/useTheme';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getAdUnitIds } from '@services/adService';

export function NativeAdBanner() {
  const { shouldShowAds } = useAds();
  const { colors } = useTheme();

  if (!shouldShowAds) return null;

  const adUnitId = getAdUnitIds().NATIVE_BANNER;

  return (
    <View className="mx-2 mb-3 items-center">
      <View className="flex-row items-center mb-0.5">
        <Megaphone size={12} color={colors.onSurfaceVariant} />
        <Text className="text-[10px] text-outline dark:text-onSurfaceVariant-dark ml-0.5">
          Sponsored Ad
        </Text>
      </View>
      <View className="border border-outlineVariant dark:border-outlineVariant-dark bg-surfaceVariant dark:bg-surfaceVariant-dark rounded-md p-1 min-h-[60px] w-full items-center justify-center">
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error) => {
            if (__DEV__) {
              console.warn('[BannerAd] Failed to load:', error);
            }
          }}
        />
      </View>
    </View>
  );
}

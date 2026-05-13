/**
 * useAds — hook for ad display logic
 *
 * Provides ad-related state and actions for components.
 * Respects premium status (no ads for premium users).
 */

import { useCallback } from 'react';
import { usePremiumStore } from '@store/usePremiumStore';
import { showInterstitial, showRewarded } from '@services/adService';
import { recordError } from '@services/crashlytics';

interface UseAdsReturn {
  /** Whether ads should be shown (false for premium users) */
  shouldShowAds: boolean;
  /** Show an interstitial ad (respects frequency cap) */
  tryShowInterstitial: () => Promise<boolean>;
  /** Show a rewarded ad (user-initiated) */
  tryShowRewarded: () => Promise<boolean>;
}

export function useAds(): UseAdsReturn {
  const isPremium = usePremiumStore((s) => s.tier === 'premium');

  const tryShowInterstitial = useCallback(async (): Promise<boolean> => {
    if (isPremium) return false;

    try {
      return await showInterstitial();
    } catch (error) {
      recordError(error, 'useAds.tryShowInterstitial');
      return false;
    }
  }, [isPremium]);

  const tryShowRewarded = useCallback(async (): Promise<boolean> => {
    try {
      return await showRewarded();
    } catch (error) {
      recordError(error, 'useAds.tryShowRewarded');
      return false;
    }
  }, []);

  return {
    shouldShowAds: !isPremium,
    tryShowInterstitial,
    tryShowRewarded,
  };
}

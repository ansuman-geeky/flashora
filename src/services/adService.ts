import { AD_UNITS, INTERSTITIAL_FREQUENCY, APP_OPEN_AD_COOLDOWN_HOURS } from '@constants/adUnits';
import { logEvent } from './analytics';
import { recordError } from './crashlytics';
import { InterstitialAd, RewardedAd, AppOpenAd, AdEventType, RewardedAdEventType } from 'react-native-google-mobile-ads';


/** Ad types supported by Flashora */
export type AdType = 'app_open' | 'native_banner' | 'interstitial' | 'rewarded';

/** Internal state for frequency capping */
let toolActionCount = 0;
let lastAppOpenAdTime = 0;

let interstitialAd: InterstitialAd | null = null;
let rewardedAd: RewardedAd | null = null;
let appOpenAd: AppOpenAd | null = null;

/**
 * Show App Open Ad on cold start or when returning to foreground.
 */
export function loadAndShowAppOpenAd(): void {
  try {


    if (!canShowAppOpenAd()) {
      return;
    }

    appOpenAd = AppOpenAd.createForAdRequest(AD_UNITS.APP_OPEN, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = appOpenAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        if (__DEV__) console.log('[AdService] App Open Ad loaded, showing...');
        appOpenAd?.show();
        markAppOpenAdShown();
        logEvent('ad_impression', { ad_type: 'app_open' });
      }
    );

    const unsubscribeError = appOpenAd.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        if (__DEV__) console.warn('[AdService] App Open Ad failed to load:', error);
        unsubscribeLoaded();
        unsubscribeError();
      }
    );

    appOpenAd.load();
  } catch (error) {
    recordError(error, 'AdService.loadAndShowAppOpenAd');
  }
}

/**
 * Initialize preloaded ads.
 */
export function initAds(): void {
  try {
    // Load App Open Ad on startup
    loadAndShowAppOpenAd();

    interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });
    interstitialAd.load();

    rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    });
    rewardedAd.load();
    
    if (__DEV__) {
      console.log('[AdService] Preloading ads initiated');
    }
  } catch (error) {
    recordError(error, 'AdService.initAds');
  }
}

/**
 * Track a tool action completion for interstitial frequency capping.
 * Returns true if an interstitial should be shown.
 */
export function trackToolAction(): boolean {
  toolActionCount++;
  return toolActionCount >= INTERSTITIAL_FREQUENCY;
}

/**
 * Reset the tool action counter (called after showing an interstitial).
 */
export function resetToolActionCount(): void {
  toolActionCount = 0;
}

/**
 * Check if enough time has passed to show an app open ad.
 */
export function canShowAppOpenAd(): boolean {
  const now = Date.now();
  const cooldownMs = APP_OPEN_AD_COOLDOWN_HOURS * 60 * 60 * 1000;
  return now - lastAppOpenAdTime >= cooldownMs;
}

/**
 * Mark that an app open ad was shown.
 */
export function markAppOpenAdShown(): void {
  lastAppOpenAdTime = Date.now();
}

/**
 * Show an interstitial ad if frequency cap allows.
 */
export async function showInterstitial(): Promise<boolean> {
  try {
    if (!trackToolAction()) {
      return false;
    }

    if (!interstitialAd) {
      initAds();
    }

    if (interstitialAd && interstitialAd.loaded) {
      await interstitialAd.show();
      resetToolActionCount();
      logEvent('ad_impression', { ad_type: 'interstitial' });
      
      // Reload for next time
      interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
      });
      interstitialAd.load();
      return true;
    } else {
      if (interstitialAd) {
        interstitialAd.load();
      }
      if (__DEV__) {
        console.log('[AdService] Interstitial not loaded yet');
      }
      return false;
    }
  } catch (error) {
    recordError(error, 'AdService.showInterstitial');
    return false;
  }
}

/**
 * Show a rewarded ad. Returns true if the user completed watching.
 */
export async function showRewarded(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (!rewardedAd) {
        initAds();
      }

      if (rewardedAd && rewardedAd.loaded) {
        const unsubscribeEarned = rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward) => {
            if (__DEV__) console.log('[AdService] User earned reward:', reward);
            logEvent('ad_impression', { ad_type: 'rewarded' });
            resolve(true);
          }
        );

        const unsubscribeClosed = rewardedAd.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            unsubscribeEarned();
            unsubscribeClosed();
            rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, {
              requestNonPersonalizedAdsOnly: true,
            });
            rewardedAd.load();
            resolve(false);
          }
        );

        rewardedAd.show();
      } else {
        if (rewardedAd) {
          rewardedAd.load();
        }
        
        let checkCount = 0;
        const interval = setInterval(() => {
          checkCount++;
          if (rewardedAd && rewardedAd.loaded) {
            clearInterval(interval);
            
            const unsubscribeEarned = rewardedAd.addAdEventListener(
              RewardedAdEventType.EARNED_REWARD,
              () => {
                logEvent('ad_impression', { ad_type: 'rewarded' });
                resolve(true);
              }
            );

            const unsubscribeClosed = rewardedAd.addAdEventListener(
              AdEventType.CLOSED,
              () => {
                unsubscribeEarned();
                unsubscribeClosed();
                rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, {
                  requestNonPersonalizedAdsOnly: true,
                });
                rewardedAd.load();
                resolve(false);
              }
            );

            rewardedAd.show();
          } else if (checkCount >= 6) { // 3 seconds timeout for better UX
            clearInterval(interval);
            if (__DEV__) console.log('[AdService] Rewarded ad load timeout');
            resolve(false);
          }
        }, 500);
      }
    } catch (error) {
      recordError(error, 'AdService.showRewarded');
      resolve(false);
    }
  });
}

/**
 * Get the current ad unit IDs (for components that render ads directly).
 */
export function getAdUnitIds() {
  return AD_UNITS;
}

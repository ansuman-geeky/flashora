/**
 * Ad Service — AdMob manager
 *
 * Centralizes all ad loading, showing, and frequency capping logic.
 * Uses test IDs in development, real IDs from .env in production.
 */

import { AD_UNITS, INTERSTITIAL_FREQUENCY, APP_OPEN_AD_COOLDOWN_HOURS } from '@constants/adUnits';
import { logEvent } from './analytics';
import { recordError } from './crashlytics';

/** Ad types supported by Flashora */
export type AdType = 'app_open' | 'native_banner' | 'interstitial' | 'rewarded';

/** Internal state for frequency capping */
let toolActionCount = 0;
let lastAppOpenAdTime = 0;

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
 *
 * Implementation will be wired to react-native-google-mobile-ads in Step 12.
 */
export async function showInterstitial(): Promise<boolean> {
  try {
    if (!trackToolAction()) {
      return false;
    }

    // Ad loading/showing will be wired in Step 12
    if (__DEV__) {
      console.log(`[AdService] Would show interstitial: ${AD_UNITS.INTERSTITIAL}`);
    }

    logEvent('ad_impression', { ad_type: 'interstitial' });
    resetToolActionCount();
    return true;
  } catch (error) {
    recordError(error, 'AdService.showInterstitial');
    return false;
  }
}

/**
 * Show a rewarded ad. Returns true if the user completed watching.
 *
 * Implementation will be wired in Step 12.
 */
export async function showRewarded(): Promise<boolean> {
  try {
    // Ad loading/showing will be wired in Step 12
    if (__DEV__) {
      console.log(`[AdService] Would show rewarded: ${AD_UNITS.REWARDED}`);
    }

    logEvent('ad_impression', { ad_type: 'rewarded' });
    return true;
  } catch (error) {
    recordError(error, 'AdService.showRewarded');
    return false;
  }
}

/**
 * Get the current ad unit IDs (for components that render ads directly).
 */
export function getAdUnitIds() {
  return AD_UNITS;
}

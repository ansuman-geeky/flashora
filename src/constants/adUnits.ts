/**
 * AdMob Ad Unit IDs
 *
 * All ad unit IDs are read from environment variables.
 * Test IDs are used as fallbacks for development.
 *
 * IMPORTANT: Never hardcode production ad unit IDs in source code.
 * Always use these constants — never inline ad IDs anywhere else.
 */

/** Google AdMob test ad unit IDs (safe for development) */
const TEST_AD_UNITS = {
  APP_OPEN: 'ca-app-pub-3940256099942544/9257395921',
  NATIVE_BANNER: 'ca-app-pub-3940256099942544/2247696110',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
} as const;

/**
 * Resolved ad unit IDs.
 *
 * In development, these use Google's official test IDs.
 * In production, they should be overridden via .env variables.
 */
export const AD_UNITS = {
  /** App Open Ad — shown on cold launch after 4h gap */
  APP_OPEN: process.env.ADMOB_APP_OPEN_ID ?? TEST_AD_UNITS.APP_OPEN,

  /** Native Banner Ad — shown on home screen bottom */
  NATIVE_BANNER:
    process.env.ADMOB_NATIVE_BANNER_ID ?? TEST_AD_UNITS.NATIVE_BANNER,

  /** Interstitial Ad — shown post tool completion (max every 2 actions) */
  INTERSTITIAL:
    process.env.ADMOB_INTERSTITIAL_ID ?? TEST_AD_UNITS.INTERSTITIAL,

  /** Rewarded Ad — user-initiated "Unlock batch trial" */
  REWARDED: process.env.ADMOB_REWARDED_ID ?? TEST_AD_UNITS.REWARDED,
} as const;

/** Maximum interstitial frequency: show at most every N tool actions */
export const INTERSTITIAL_FREQUENCY = 2;

/** Minimum hours between app open ads */
export const APP_OPEN_AD_COOLDOWN_HOURS = 4;

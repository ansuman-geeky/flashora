/**
 * Remote Config Service — Firebase Remote Config wrapper
 *
 * Provides feature flags and dynamic configuration from Firebase.
 * All flags have local fallback defaults so the app works offline.
 */

/** Remote config keys and their types */
export interface RemoteConfigValues {
  ads_enabled: boolean;
  interstitial_frequency: number;
  rewarded_enabled: boolean;
  premium_price_inr: number;
}

/** Default values — used when Remote Config is unreachable */
const DEFAULTS: RemoteConfigValues = {
  ads_enabled: true,
  interstitial_frequency: 2,
  rewarded_enabled: true,
  premium_price_inr: 149,
};

import remoteConfig from '@react-native-firebase/remote-config';

/** In-memory cache of resolved config values */
let configCache: RemoteConfigValues = { ...DEFAULTS };

/**
 * Initialize Remote Config and fetch latest values.
 */
export async function initRemoteConfig(): Promise<void> {
  try {
    // Set configuration settings
    remoteConfig().settings.minimumFetchIntervalMillis = __DEV__ ? 0 : 3600000;

    // Set defaults
    await remoteConfig().setDefaults(DEFAULTS as any);

    // Fetch and activate
    await remoteConfig().fetchAndActivate();

    // Cache the resolved values
    configCache = {
      ads_enabled: remoteConfig().getBoolean('ads_enabled'),
      interstitial_frequency: remoteConfig().getNumber('interstitial_frequency'),
      rewarded_enabled: remoteConfig().getBoolean('rewarded_enabled'),
      premium_price_inr: remoteConfig().getNumber('premium_price_inr'),
    };

    if (__DEV__) {
      console.log('[RemoteConfig] Loaded Remote Config successfully:', configCache);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[RemoteConfig] Failed to fetch, using defaults:', error);
    }
    configCache = { ...DEFAULTS };
  }
}

/**
 * Get a remote config value.
 */
export function getConfigValue<K extends keyof RemoteConfigValues>(
  key: K
): RemoteConfigValues[K] {
  return configCache[key];
}

/**
 * Get all remote config values.
 */
export function getAllConfigValues(): Readonly<RemoteConfigValues> {
  return { ...configCache };
}

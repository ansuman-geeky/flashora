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

/** In-memory cache of resolved config values */
let configCache: RemoteConfigValues = { ...DEFAULTS };

/**
 * Initialize Remote Config and fetch latest values.
 *
 * Implementation will be wired to @react-native-firebase/remote-config in Step 13.
 */
export async function initRemoteConfig(): Promise<void> {
  try {
    // Firebase Remote Config will be wired here in Step 13
    // For now, use defaults
    configCache = { ...DEFAULTS };

    if (__DEV__) {
      console.log('[RemoteConfig] Initialized with defaults:', configCache);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[RemoteConfig] Failed to fetch, using defaults:', error);
    }
    // Silently fall back to defaults — app must always work
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

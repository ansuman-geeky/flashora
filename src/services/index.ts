/**
 * Services — Barrel Export
 */

export { logEvent } from './analytics';
export type { FlashoraEvent, EventParams } from './analytics';

export { recordError, setCustomKey, setUserId, log as crashLog } from './crashlytics';

export { initRemoteConfig, getConfigValue, getAllConfigValues } from './remoteConfig';
export type { RemoteConfigValues } from './remoteConfig';

export {
  showInterstitial,
  showRewarded,
  getAdUnitIds,
  canShowAppOpenAd,
  markAppOpenAdShown,
} from './adService';
export type { AdType } from './adService';

export { shortenUrl, registerProvider } from './urlShortener';
export type { UrlShortenerProvider } from './urlShortener';

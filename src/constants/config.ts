/**
 * App Configuration Constants
 *
 * Static configuration values used throughout the app.
 * Runtime-configurable values should use Firebase Remote Config instead.
 */

/** App metadata */
export const APP_CONFIG = {
  name: 'Flashora',
  tagline: 'Fast. Smart. Utility.',
  packageName: 'com.flashora.app',
  version: '1.0.0',
  minAndroidSdk: 26,
} as const;

/** File size limits (in bytes) */
export const FILE_LIMITS = {
  /** Maximum single file size: 50MB */
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  /** Maximum total batch size: 200MB */
  MAX_BATCH_SIZE: 200 * 1024 * 1024,
  /** Minimum free storage required before writing: 100MB */
  MIN_FREE_STORAGE: 100 * 1024 * 1024,
} as const;

/** Supported file types by tool category */
export const SUPPORTED_FORMATS = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/webp'],
  text: ['text/plain'],
} as const;

/** URL Shortener configuration */
export const URL_SHORTENER_CONFIG = {
  /** Default provider */
  defaultProvider: 'tinyurl' as const,
  /** TinyURL API base URL */
  tinyurlBaseUrl: 'https://api.tinyurl.com',
  /** Request timeout in milliseconds */
  requestTimeoutMs: 10_000,
} as const;

/** Performance budget targets */
export const PERFORMANCE_TARGETS = {
  coldLaunchMs: 1800,
  screenTransitionMs: 250,
  toolProcessingUiMs: 100,
  maxBundleSizeMb: 12,
  maxMemoryMb: 150,
} as const;

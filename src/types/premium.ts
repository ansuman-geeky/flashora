/**
 * Premium type definitions — subscription state and gating logic.
 */

/** Available premium plans */
export type PremiumPlan = 'monthly' | 'yearly';

/** Premium tier for feature gating */
export type PremiumTier = 'free' | 'premium';

/** Premium subscription state */
export interface PremiumState {
  /** Current tier */
  tier: PremiumTier;
  /** Whether the user is currently subscribed */
  isActive: boolean;
  /** Subscription plan if active */
  plan?: PremiumPlan;
  /** Expiration ISO timestamp if active */
  expiresAt?: string;
}

/** Premium feature limits for the free tier */
export interface FreeTierLimits {
  /** Maximum PDF operations per day */
  maxPdfOpsPerDay: number;
  /** Whether batch processing is allowed */
  batchProcessingAllowed: boolean;
  /** Whether high-quality compression is allowed */
  highQualityCompression: boolean;
  /** Whether custom QR colors are allowed */
  customQrColors: boolean;
  /** Number of available themes */
  availableThemes: number;
}

/** Default limits for free tier users */
export const FREE_TIER_LIMITS: FreeTierLimits = {
  maxPdfOpsPerDay: 5,
  batchProcessingAllowed: false,
  highQualityCompression: false,
  customQrColors: false,
  availableThemes: 2, // Light + Dark only
};

/** Pricing configuration (fallback — overridden by Remote Config) */
export const DEFAULT_PRICING = {
  monthly: {
    priceInr: 149,
    label: '₹149/month',
  },
  yearly: {
    priceInr: 799,
    label: '₹799/year',
    savingsPercent: 55,
  },
} as const;

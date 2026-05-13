/**
 * Premium Store — Zustand slice for premium subscription state
 *
 * Manages the user's premium tier, subscription status, and usage tracking.
 * Persisted to MMKV (will be wired in a later step).
 */

import { create } from 'zustand';
import type { PremiumState, PremiumPlan, PremiumTier } from '@app-types/premium';
import { FREE_TIER_LIMITS } from '@app-types/premium';

export interface PremiumStoreState extends PremiumState {
  /** Daily PDF operation count (resets at midnight) */
  dailyPdfOps: number;
  /** Date string of the last PDF op count reset (YYYY-MM-DD) */
  lastPdfOpsResetDate: string;

  // Actions
  setPremiumTier: (tier: PremiumTier) => void;
  activateSubscription: (plan: PremiumPlan, expiresAt: string) => void;
  deactivateSubscription: () => void;
  incrementPdfOps: () => boolean; // returns false if limit reached
  resetDailyPdfOps: () => void;
  canPerformPdfOp: () => boolean;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

export const usePremiumStore = create<PremiumStoreState>((set, get) => ({
  tier: 'free',
  isActive: false,
  plan: undefined,
  expiresAt: undefined,
  dailyPdfOps: 0,
  lastPdfOpsResetDate: getTodayDateString(),

  setPremiumTier: (tier) => set({ tier }),

  activateSubscription: (plan, expiresAt) =>
    set({
      tier: 'premium',
      isActive: true,
      plan,
      expiresAt,
    }),

  deactivateSubscription: () =>
    set({
      tier: 'free',
      isActive: false,
      plan: undefined,
      expiresAt: undefined,
    }),

  incrementPdfOps: () => {
    const state = get();
    // Premium users have unlimited ops
    if (state.tier === 'premium') return true;

    // Check if we need to reset the daily counter
    const today = getTodayDateString();
    if (state.lastPdfOpsResetDate !== today) {
      set({ dailyPdfOps: 1, lastPdfOpsResetDate: today });
      return true;
    }

    // Check limit
    if (state.dailyPdfOps >= FREE_TIER_LIMITS.maxPdfOpsPerDay) {
      return false;
    }

    set({ dailyPdfOps: state.dailyPdfOps + 1 });
    return true;
  },

  resetDailyPdfOps: () =>
    set({ dailyPdfOps: 0, lastPdfOpsResetDate: getTodayDateString() }),

  canPerformPdfOp: () => {
    const state = get();
    if (state.tier === 'premium') return true;

    const today = getTodayDateString();
    if (state.lastPdfOpsResetDate !== today) return true;

    return state.dailyPdfOps < FREE_TIER_LIMITS.maxPdfOpsPerDay;
  },
}));

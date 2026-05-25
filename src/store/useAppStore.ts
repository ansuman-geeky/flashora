/**
 * App Store — Zustand global state
 *
 * Manages app-wide state: theme, onboarding status, tool action counter.
 * Persisted to MMKV for instant hydration on cold start.
 */

import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

export interface AppState {
  /** Current theme preference */
  themeMode: ThemeMode;
  /** Whether the user has completed onboarding */
  hasOnboarded: boolean;
  /** Counter for interstitial ad frequency capping */
  toolActionsSinceLastAd: number;
  /** Last app open ad timestamp (ms) */
  lastAppOpenAdTime: number;
  /** Favorited tool IDs */
  favorites: string[];

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setHasOnboarded: (value: boolean) => void;
  incrementToolActions: () => void;
  resetToolActions: () => void;
  setLastAppOpenAdTime: (time: number) => void;
  toggleFavorite: (toolId: string) => void;
}

/**
 * Global app store.
 *
 * MMKV persistence middleware will be added in Step 3 when we wire up storage.
 * For now, state resets on app restart (acceptable for scaffold).
 */
export const useAppStore = create<AppState>((set) => ({
  themeMode: 'light',
  hasOnboarded: false,
  toolActionsSinceLastAd: 0,
  lastAppOpenAdTime: 0,
  favorites: [],

  setThemeMode: (mode) => set({ themeMode: mode }),
  setHasOnboarded: (value) => set({ hasOnboarded: value }),
  incrementToolActions: () =>
    set((state) => ({
      toolActionsSinceLastAd: state.toolActionsSinceLastAd + 1,
    })),
  resetToolActions: () => set({ toolActionsSinceLastAd: 0 }),
  setLastAppOpenAdTime: (time) => set({ lastAppOpenAdTime: time }),
  toggleFavorite: (toolId) =>
    set((state) => ({
      favorites: state.favorites.includes(toolId)
        ? state.favorites.filter((id) => id !== toolId)
        : [...state.favorites, toolId],
    })),
}));

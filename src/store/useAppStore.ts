/**
 * App Store — Zustand global state
 *
 * Manages app-wide state: theme, onboarding status, tool action counter.
 * Persisted to MMKV for instant hydration on cold start.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  /** Is the user a premium subscriber */
  isPremiumUser: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setHasOnboarded: (value: boolean) => void;
  incrementToolActions: () => void;
  resetToolActions: () => void;
  setLastAppOpenAdTime: (time: number) => void;
  toggleFavorite: (toolId: string) => void;
  setIsPremiumUser: (value: boolean) => void;
}

/**
 * Global app store.
 *
 * MMKV/AsyncStorage persistence middleware added to persist state on cold start.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      hasOnboarded: false,
      toolActionsSinceLastAd: 0,
      lastAppOpenAdTime: 0,
      favorites: [],
      isPremiumUser: false,

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
      setIsPremiumUser: (value) => set({ isPremiumUser: value }),
    }),
    {
      name: 'flashora-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        hasOnboarded: state.hasOnboarded,
        favorites: state.favorites,
        isPremiumUser: state.isPremiumUser,
      }), // only persist specific fields
    }
  )
);

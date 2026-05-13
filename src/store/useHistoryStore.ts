/**
 * History Store — Zustand slice for tool usage history
 *
 * Tracks all tool operations for the Activity screen.
 * Persisted to MMKV (will be wired in a later step).
 */

import { create } from 'zustand';
import type { HistoryEntry } from '@app-types/history';

export interface HistoryState {
  /** All history entries, newest first */
  entries: HistoryEntry[];
  /** Maximum entries to keep (older ones are pruned) */
  maxEntries: number;

  // Actions
  addEntry: (entry: HistoryEntry) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: [],
  maxEntries: 500,

  addEntry: (entry) =>
    set((state) => {
      const updated = [entry, ...state.entries];
      // Prune to max entries
      if (updated.length > state.maxEntries) {
        updated.length = state.maxEntries;
      }
      return { entries: updated };
    }),

  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),

  clearHistory: () => set({ entries: [] }),
}));

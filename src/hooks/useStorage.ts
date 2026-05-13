/**
 * useStorage — MMKV storage hook
 *
 * Provides typed get/set operations for persistent key-value storage.
 * All storage in Flashora goes through MMKV (10x faster than AsyncStorage).
 *
 * MMKV instance will be initialized here in a later step.
 * For now, uses an in-memory Map as a fallback.
 */

import { useCallback } from 'react';

/** In-memory fallback storage (replaced with MMKV in Step 3) */
const memoryStore = new Map<string, string>();

/**
 * Get a string value from storage.
 */
export function getStorageItem(key: string): string | undefined {
  // Will use MMKV.getString(key) after setup
  return memoryStore.get(key);
}

/**
 * Set a string value in storage.
 */
export function setStorageItem(key: string, value: string): void {
  // Will use MMKV.set(key, value) after setup
  memoryStore.set(key, value);
}

/**
 * Delete a value from storage.
 */
export function deleteStorageItem(key: string): void {
  // Will use MMKV.delete(key) after setup
  memoryStore.delete(key);
}

/**
 * Hook for using typed MMKV storage within components.
 */
export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const get = useCallback((): T => {
    const raw = getStorageItem(key);
    if (raw === undefined) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const set = useCallback(
    (value: T): void => {
      setStorageItem(key, JSON.stringify(value));
    },
    [key]
  );

  return [get(), set];
}

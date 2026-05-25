/**
 * Crashlytics Service — Firebase Crashlytics wrapper
 *
 * Centralizes all crash/error reporting. Every caught error in the app
 * should be reported through this service.
 */

import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Record a non-fatal error to Crashlytics.
 */
export function recordError(error: unknown, context?: string): void {
  let errorObj: Error;
  
  if (error instanceof Error) {
    errorObj = error;
  } else if (typeof error === 'object' && error !== null) {
    const msg = (error as any).message || JSON.stringify(error);
    errorObj = new Error(msg);
  } else {
    errorObj = new Error(String(error));
  }

  if (__DEV__) {
    console.error(`[Crashlytics] ${context ?? 'Unknown context'}:`, errorObj);
  }
  
  try {
    if (context) {
      void crashlytics().setAttribute('context', context);
    }
    void crashlytics().recordError(errorObj);
  } catch (err) {
    if (__DEV__) {
      console.warn('[Crashlytics] Failed to record error to Firebase:', err);
    }
  }
}

/**
 * Set a custom key-value pair for crash context.
 */
export function setCustomKey(key: string, value: string | number | boolean): void {
  if (__DEV__) {
    console.log(`[Crashlytics] Set key: ${key} = ${String(value)}`);
  }
  try {
    void crashlytics().setAttribute(key, String(value));
  } catch (err) {
    if (__DEV__) {
      console.warn('[Crashlytics] Failed to set attribute:', err);
    }
  }
}

/**
 * Set the user ID for crash reports.
 */
export function setUserId(userId: string): void {
  if (__DEV__) {
    console.log(`[Crashlytics] Set userId: ${userId}`);
  }
  try {
    void crashlytics().setUserId(userId);
  } catch (err) {
    if (__DEV__) {
      console.warn('[Crashlytics] Failed to set user ID:', err);
    }
  }
}

/**
 * Log a breadcrumb message for crash debugging.
 */
export function log(message: string): void {
  if (__DEV__) {
    console.log(`[Crashlytics] ${message}`);
  }
  try {
    void crashlytics().log(message);
  } catch (err) {
    if (__DEV__) {
      console.warn('[Crashlytics] Failed to log breadcrumb message:', err);
    }
  }
}

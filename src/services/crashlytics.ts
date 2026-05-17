/**
 * Crashlytics Service — Firebase Crashlytics wrapper
 *
 * Centralizes all crash/error reporting. Every caught error in the app
 * should be reported through this service.
 */

/**
 * Record a non-fatal error to Crashlytics.
 *
 * Implementation will be wired to @react-native-firebase/crashlytics in Step 13.
 * For now, logs to console in development.
 */
export function recordError(error: unknown, context?: string): void {
  let errorObj: Error;
  
  if (error instanceof Error) {
    errorObj = error;
  } else if (typeof error === 'object' && error !== null) {
    // Handle plain objects with message property (common in JS/Native errors)
    const msg = (error as any).message || JSON.stringify(error);
    errorObj = new Error(msg);
  } else {
    errorObj = new Error(String(error));
  }

  if (__DEV__) {
    console.error(`[Crashlytics] ${context ?? 'Unknown context'}:`, errorObj);
  }
  // Firebase Crashlytics will be wired here in Step 13
}

/**
 * Set a custom key-value pair for crash context.
 */
export function setCustomKey(key: string, value: string | number | boolean): void {
  if (__DEV__) {
    console.log(`[Crashlytics] Set key: ${key} = ${String(value)}`);
  }
  // Firebase Crashlytics will be wired here in Step 13
}

/**
 * Set the user ID for crash reports.
 */
export function setUserId(userId: string): void {
  if (__DEV__) {
    console.log(`[Crashlytics] Set userId: ${userId}`);
  }
  // Firebase Crashlytics will be wired here in Step 13
}

/**
 * Log a breadcrumb message for crash debugging.
 */
export function log(message: string): void {
  if (__DEV__) {
    console.log(`[Crashlytics] ${message}`);
  }
  // Firebase Crashlytics will be wired here in Step 13
}

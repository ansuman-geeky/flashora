/**
 * Analytics Service — Firebase Analytics wrapper
 *
 * Provides a typed, centralized interface for all analytics events.
 * Every event in the app flows through this service.
 */

/** All analytics event names used in Flashora */
export type FlashoraEvent =
  | 'app_open'
  | 'tool_open'
  | 'tool_success'
  | 'tool_failure'
  | 'ad_impression'
  | 'ad_click'
  | 'premium_view'
  | 'premium_click'
  | 'premium_upgrade';

/** Event parameter types */
export interface EventParams {
  app_open: undefined;
  tool_open: { tool_id: string; source: string };
  tool_success: { tool_id: string; duration_ms: number; file_size_kb: number };
  tool_failure: { tool_id: string; error_code: string };
  ad_impression: { ad_type: string };
  ad_click: { ad_type: string };
  premium_view: undefined;
  premium_click: { plan: 'monthly' | 'yearly' };
  premium_upgrade: { plan: 'monthly' | 'yearly'; revenue_inr: number };
}

/**
 * Log an analytics event.
 *
 * Implementation will be wired to @react-native-firebase/analytics in Step 13.
 * For now, this is a typed stub that logs to console in development.
 */
export function logEvent<T extends FlashoraEvent>(
  event: T,
  params?: EventParams[T]
): void {
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, params ?? '');
  }
  // Firebase analytics will be wired here in Step 13
}

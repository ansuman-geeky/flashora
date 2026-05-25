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
  | 'premium_upgrade'
  | 'scanner_open'
  | 'scanner_capture'
  | 'scanner_edge_auto'
  | 'scanner_edge_manual'
  | 'scanner_enhance'
  | 'scanner_export'
  | 'scanner_export_gate'
  | 'scanner_failure';

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
  scanner_open: undefined;
  scanner_capture: undefined;
  scanner_edge_auto: undefined;
  scanner_edge_manual: undefined;
  scanner_enhance: undefined;
  scanner_export: { format: string; quality: string; page_count: number };
  scanner_export_gate: { format: string };
  scanner_failure: { error_code: string };
}

import analytics from '@react-native-firebase/analytics';

/**
 * Log an analytics event.
 */
export function logEvent<T extends FlashoraEvent>(
  event: T,
  params?: EventParams[T]
): void {
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, params ?? '');
  }
  try {
    void analytics().logEvent(event, params ?? {});
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] Failed to log event to Firebase:', error);
    }
  }
}

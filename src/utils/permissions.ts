/**
 * Permission Utilities — contextual permission request helpers
 *
 * IMPORTANT: Permissions are NEVER requested on app launch.
 * They are requested only when the user first needs the feature.
 */

import type { ToolErrorCode } from '@app-types/tool';

/** Permission types used in Flashora */
export type FlashoraPermission = 'camera' | 'mediaLibrary' | 'storage';

/** Result of a permission request */
export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Request camera permission (QR scan screen only).
 *
 * Implementation will use expo-camera's requestCameraPermissionsAsync.
 * Stubbed for scaffold — will be implemented in Step 7 (QR Tools).
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  // Will be implemented with expo-camera in Step 7
  if (__DEV__) {
    console.log('[Permissions] Camera permission requested');
  }
  return { granted: true, canAskAgain: true };
}

/**
 * Request media library permission (save to gallery).
 *
 * Implementation will use expo-media-library's requestPermissionsAsync.
 */
export async function requestMediaLibraryPermission(): Promise<PermissionResult> {
  // Will be implemented with expo-media-library in later steps
  if (__DEV__) {
    console.log('[Permissions] Media library permission requested');
  }
  return { granted: true, canAskAgain: true };
}

/**
 * Map a permission denial to a ToolErrorCode.
 */
export function permissionDeniedError(): ToolErrorCode {
  return 'PERMISSION_DENIED';
}

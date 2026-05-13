/**
 * usePermissions — contextual permission request hook
 *
 * Wraps permission utilities in a React hook with state tracking.
 * Never requests permissions on mount — only on explicit call.
 */

import { useState, useCallback } from 'react';
import type { FlashoraPermission, PermissionResult } from '@utils/permissions';
import {
  requestCameraPermission,
  requestMediaLibraryPermission,
} from '@utils/permissions';

interface UsePermissionsReturn {
  /** Whether the permission is granted */
  granted: boolean;
  /** Whether a request is in progress */
  requesting: boolean;
  /** Whether the user denied and can't be asked again */
  permanentlyDenied: boolean;
  /** Request the permission (call this when the user needs the feature) */
  request: () => Promise<boolean>;
}

/**
 * Hook for contextual permission requests.
 *
 * Usage:
 * ```tsx
 * const camera = usePermissions('camera');
 * // Later, when user taps "Scan QR":
 * const granted = await camera.request();
 * ```
 */
export function usePermissions(
  permission: FlashoraPermission
): UsePermissionsReturn {
  const [granted, setGranted] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [permanentlyDenied, setPermanentlyDenied] = useState(false);

  const request = useCallback(async (): Promise<boolean> => {
    setRequesting(true);

    let result: PermissionResult;

    try {
      switch (permission) {
        case 'camera':
          result = await requestCameraPermission();
          break;
        case 'mediaLibrary':
        case 'storage':
          result = await requestMediaLibraryPermission();
          break;
        default:
          result = { granted: false, canAskAgain: false };
      }

      setGranted(result.granted);
      setPermanentlyDenied(!result.granted && !result.canAskAgain);
      return result.granted;
    } catch {
      setGranted(false);
      return false;
    } finally {
      setRequesting(false);
    }
  }, [permission]);

  return { granted, requesting, permanentlyDenied, request };
}

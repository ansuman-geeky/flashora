/**
 * Utils — Barrel Export
 */

export {
  validateFile,
  validateBatch,
  getFileExtension,
  generateOutputFilename,
  formatFileSize,
  isSupportedFormat,
} from './fileUtils';
export type { FileInfo } from './fileUtils';

export {
  requestCameraPermission,
  requestMediaLibraryPermission,
  permissionDeniedError,
} from './permissions';
export type { FlashoraPermission, PermissionResult } from './permissions';

export {
  isValidUrl,
  isValidEmail,
  isValidPhone,
  isValidSsid,
  isValidPdfPassword,
  isNonEmpty,
} from './validators';

export {
  formatDuration,
  formatRelativeDate,
  formatTime,
  truncate,
  formatNumber,
  formatCurrencyInr,
} from './formatters';

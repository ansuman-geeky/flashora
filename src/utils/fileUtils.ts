/**
 * File Utilities — helpers for file operations
 */

import { FILE_LIMITS, SUPPORTED_FORMATS } from '@constants/config';
import * as FileSystem from 'expo-file-system';
import type { ToolErrorCode } from '@app-types/tool';

/** File metadata extracted from a picker result */
export interface FileInfo {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Validate a file before processing.
 * Returns null if valid, or a ToolErrorCode if invalid.
 */
export function validateFile(
  file: FileInfo,
  allowedMimeTypes: readonly string[]
): ToolErrorCode | null {
  if (!file.uri || !file.name) {
    return 'INVALID_FILE';
  }

  if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
    return 'FILE_TOO_LARGE';
  }

  if (!allowedMimeTypes.includes(file.mimeType)) {
    return 'UNSUPPORTED_FORMAT';
  }

  return null;
}

/**
 * Validate multiple files for batch processing.
 */
export function validateBatch(
  files: FileInfo[],
  allowedMimeTypes: readonly string[]
): ToolErrorCode | null {
  if (files.length === 0) {
    return 'INVALID_FILE';
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > FILE_LIMITS.MAX_BATCH_SIZE) {
    return 'FILE_TOO_LARGE';
  }

  for (const file of files) {
    const error = validateFile(file, allowedMimeTypes);
    if (error !== null) return error;
  }

  return null;
}

/**
 * Get the file extension from a filename.
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? '') : '';
}

/**
 * Generate a unique output filename with timestamp.
 */
export function generateOutputFilename(
  baseName: string,
  suffix: string,
  extension: string
): string {
  const timestamp = Date.now();
  const cleanBase = baseName.replace(/\.[^.]+$/, '');
  return `${cleanBase}_${suffix}_${timestamp}.${extension}`;
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, units.length - 1);
  const unit = units[unitIndex];

  if (unitIndex === 0) return `${bytes} ${unit ?? 'B'}`;

  return `${(bytes / Math.pow(k, unitIndex)).toFixed(1)} ${unit ?? 'B'}`;
}

/**
 * Check if a MIME type is supported for a given format category.
 */
export function isSupportedFormat(
  mimeType: string,
  category: keyof typeof SUPPORTED_FORMATS
): boolean {
  const formats = SUPPORTED_FORMATS[category];
  return (formats as readonly string[]).includes(mimeType);
}

/**
 * Get detailed file information from a URI
 */
export async function getFileInfo(uri: string): Promise<FileInfo> {
  const info = await FileSystem.getInfoAsync(uri, { size: true });
  const name = uri.split('/').pop() || 'file';
  
  // Default values if info is not available
  const size = (info as any).size || 0;
  
  // Determine mimeType from extension
  const ext = name.split('.').pop()?.toLowerCase();
  let mimeType = 'application/octet-stream';
  if (ext === 'pdf') mimeType = 'application/pdf';
  else if (['jpg', 'jpeg'].includes(ext!)) mimeType = 'image/jpeg';
  else if (ext === 'png') mimeType = 'image/png';
  else if (ext === 'webp') mimeType = 'image/webp';

  return {
    uri,
    name,
    size,
    mimeType,
  };
}
import { Buffer } from 'buffer';

/**
 * Convert base64 string to Uint8Array.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

/**
 * Convert Uint8Array to base64 string.
 */
export function uint8ArrayToBase64(array: Uint8Array): string {
  return Buffer.from(array).toString('base64');
}

/**
 * Image Tool Types
 */

import type { FileInfo } from '@utils/fileUtils';

export type ImageFormat = 'jpeg' | 'png' | 'webp';

export interface ImageResizeOptions {
  width?: number;
  height?: number;
}

export interface ImageCompressionOptions {
  quality: number; // 0 to 1
  format?: ImageFormat;
}

export interface ImageConvertOptions {
  format: ImageFormat;
  quality?: number;
}

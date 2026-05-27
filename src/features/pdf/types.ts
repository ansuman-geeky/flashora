/**
 * PDF Feature — Type definitions
 */

/** Compression quality presets */
export type CompressionQuality = 'low' | 'medium' | 'high';

/** Compression quality settings */
export const COMPRESSION_PRESETS: Record<CompressionQuality, { label: string; description: string; factor: number }> = {
  low: { label: 'Minimum Compression', description: 'Best quality, larger file', factor: 0.8 },
  medium: { label: 'Balanced', description: 'Good balance of size and quality', factor: 0.6 },
  high: { label: 'Maximum Compression', description: 'Smallest file, lower quality', factor: 0.3 },
};

/** PDF page info for reordering */
export interface PdfPage {
  index: number;
  label: string;
}

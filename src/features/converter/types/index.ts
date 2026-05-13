/**
 * Converter Types
 */

import type { FileInfo } from '@utils/fileUtils';

export type ConversionFormat = 'pdf' | 'docx' | 'txt' | 'jpg' | 'png';

export interface ConversionRequest {
  inputFile: FileInfo;
  targetFormat: ConversionFormat;
  options?: Record<string, any>;
}

export interface ConversionResult {
  outputFile: FileInfo;
  success: boolean;
  error?: string;
}

/** Interface for conversion providers */
export interface ConversionProvider {
  id: string;
  name: string;
  supportedConversions: Array<{ from: ConversionFormat; to: ConversionFormat }>;
  convert: (request: ConversionRequest) => Promise<ConversionResult>;
}

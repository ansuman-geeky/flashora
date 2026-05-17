/**
 * Tool type definitions — core data model for all tools in Flashora.
 */

/** Tool categories mapping to feature modules */
export type ToolCategory = 'pdf' | 'qr' | 'image' | 'converter' | 'url-shortener' | 'scanner';

/** Individual tool definition used throughout the app */
export interface Tool {
  /** Unique identifier, e.g. 'pdf_merge', 'qr_scan' */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Lucide icon name */
  icon: string;
  /** Category this tool belongs to */
  category: ToolCategory;
  /** Category color from design tokens */
  color: string;
  /** Expo Router path for this tool's screen */
  route: string;
  /** Short description for search/tooltips */
  description: string;
  /** Whether this tool requires premium */
  isPremium: boolean;
}

/** Tool processing status */
export type ToolProcessingStatus =
  | 'idle'
  | 'selecting'
  | 'validating'
  | 'processing'
  | 'completed'
  | 'failed';

/** Standard error states every tool must handle */
export type ToolErrorCode =
  | 'INVALID_FILE'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'STORAGE_FULL'
  | 'PERMISSION_DENIED'
  | 'NETWORK_ERROR'
  | 'PROCESSING_FAILED';

/** Structured error for tool operations */
export interface ToolError {
  code: ToolErrorCode;
  message: string;
  /** Original error for crash reporting (never shown to users) */
  originalError?: unknown;
}

/** Result of a tool operation */
export interface ToolResult {
  /** Output file URI(s) */
  outputUris: string[];
  /** Human-readable output file name(s) */
  outputNames: string[];
  /** Processing duration in milliseconds */
  durationMs: number;
  /** Output file size in bytes */
  fileSizeBytes: number;
}

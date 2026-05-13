/**
 * History type definitions — tracks tool usage for the Activity screen.
 */

import type { ToolCategory, ToolErrorCode } from './tool';

/** A single history entry for a tool operation */
export interface HistoryEntry {
  /** Unique ID for this entry */
  id: string;
  /** Tool ID that was used */
  toolId: string;
  /** Tool display name */
  toolName: string;
  /** Tool category for color/icon mapping */
  category: ToolCategory;
  /** ISO timestamp of when the operation was performed */
  timestamp: string;
  /** Whether the operation succeeded */
  success: boolean;
  /** Error code if the operation failed */
  errorCode?: ToolErrorCode;
  /** Input file name(s) */
  inputNames: string[];
  /** Output file name(s) */
  outputNames: string[];
  /** Processing duration in milliseconds */
  durationMs: number;
  /** Output file size in bytes (0 if failed) */
  fileSizeBytes: number;
  /** Output file URI(s) for re-opening */
  outputUris: string[];
}

/** Grouped history entries by date */
export interface HistoryGroup {
  /** Display label: "Today", "Yesterday", "May 12, 2026", etc. */
  label: string;
  /** Entries within this group, newest first */
  entries: HistoryEntry[];
}

/**
 * useToolProcessor — Generic hook for tool processing flow
 *
 * Manages the standard flow: idle → selecting → validating → processing → completed/failed
 * Every tool screen uses this pattern.
 */

import { useState, useCallback, useRef } from 'react';
import type { ToolProcessingStatus, ToolError, ToolResult } from '@app-types/tool';
import { logEvent } from '@services/analytics';
import { recordError } from '@services/crashlytics';
import { useHistoryStore } from '@store/useHistoryStore';
import { useAds } from '@hooks/useAds';

interface UseToolProcessorOptions {
  toolId: string;
  toolName: string;
  category: 'pdf' | 'qr' | 'image' | 'converter' | 'url-shortener';
}

export interface UseToolProcessorReturn {
  status: ToolProcessingStatus;
  error: ToolError | null;
  result: ToolResult | null;
  progress: number;
  setProgress: (p: number) => void;
  execute: (processFn: () => Promise<ToolResult>) => Promise<void>;
  reset: () => void;
}

export function useToolProcessor({
  toolId, toolName, category,
}: UseToolProcessorOptions): UseToolProcessorReturn {
  const [status, setStatus] = useState<ToolProcessingStatus>('idle');
  const [error, setError] = useState<ToolError | null>(null);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [progress, setProgress] = useState(0);
  const isMounted = useRef(true);

  const addHistoryEntry = useHistoryStore((s) => s.addEntry);
  const { tryShowInterstitial } = useAds();

  const execute = useCallback(async (processFn: () => Promise<ToolResult>) => {
    if (!isMounted.current) return;

    setStatus('processing');
    setError(null);
    setResult(null);
    setProgress(-1); // indeterminate

    try {
      const toolResult = await processFn();

      if (!isMounted.current) return;

      setResult(toolResult);
      setStatus('completed');
      setProgress(100);

      // Log success analytics
      logEvent('tool_success', {
        tool_id: toolId,
        duration_ms: toolResult.durationMs,
        file_size_kb: Math.round(toolResult.fileSizeBytes / 1024),
      });

      // Add to history
      addHistoryEntry({
        id: `${toolId}_${Date.now()}`,
        toolId,
        toolName,
        category,
        timestamp: new Date().toISOString(),
        success: true,
        inputNames: [],
        outputNames: toolResult.outputNames,
        durationMs: toolResult.durationMs,
        fileSizeBytes: toolResult.fileSizeBytes,
        outputUris: toolResult.outputUris,
      });

      // Try showing interstitial ad
      void tryShowInterstitial();
    } catch (err) {
      if (!isMounted.current) return;

      const toolError = isToolError(err)
        ? err
        : { code: 'PROCESSING_FAILED' as const, message: 'An unexpected error occurred', originalError: err };

      setError(toolError);
      setStatus('failed');

      recordError(err, `useToolProcessor.${toolId}`);
      logEvent('tool_failure', { tool_id: toolId, error_code: toolError.code });

      // Add failure to history
      addHistoryEntry({
        id: `${toolId}_${Date.now()}`,
        toolId,
        toolName,
        category,
        timestamp: new Date().toISOString(),
        success: false,
        errorCode: toolError.code,
        inputNames: [],
        outputNames: [],
        durationMs: 0,
        fileSizeBytes: 0,
        outputUris: [],
      });
    }
  }, [toolId, toolName, category, addHistoryEntry, tryShowInterstitial]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
    setProgress(0);
  }, []);

  return { status, error, result, progress, setProgress, execute, reset };
}

function isToolError(err: unknown): err is ToolError {
  return typeof err === 'object' && err !== null && 'code' in err && 'message' in err;
}

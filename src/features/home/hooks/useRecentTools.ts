/**
 * useRecentTools — Returns the most recently used tools from history
 */

import { useMemo } from 'react';
import { useHistoryStore } from '@store/useHistoryStore';
import { TOOLS_BY_ID } from '@constants/tools';
import type { Tool } from '@app-types/tool';

export interface RecentToolEntry {
  tool: Tool;
  lastUsed: string;
  useCount: number;
}

/**
 * Returns recent unique tools from history, sorted by last use.
 */
export function useRecentTools(limit: number = 6): RecentToolEntry[] {
  const entries = useHistoryStore((s) => s.entries);

  return useMemo(() => {
    const toolMap = new Map<string, { lastUsed: string; useCount: number }>();

    for (const entry of entries) {
      const existing = toolMap.get(entry.toolId);
      if (existing) {
        existing.useCount++;
        if (entry.timestamp > existing.lastUsed) {
          existing.lastUsed = entry.timestamp;
        }
      } else {
        toolMap.set(entry.toolId, {
          lastUsed: entry.timestamp,
          useCount: 1,
        });
      }
    }

    const results: RecentToolEntry[] = [];
    for (const [toolId, data] of toolMap.entries()) {
      const tool = TOOLS_BY_ID[toolId];
      if (tool) {
        results.push({ tool, ...data });
      }
    }

    results.sort((a, b) => b.lastUsed.localeCompare(a.lastUsed));
    return results.slice(0, limit);
  }, [entries, limit]);
}

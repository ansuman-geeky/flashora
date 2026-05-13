/**
 * useToolSearch — Real-time tool search hook
 *
 * Searches across all 19 tools by name, description, and category.
 * Returns filtered results with debounced query.
 */

import { useState, useMemo, useCallback } from 'react';
import { TOOLS } from '@constants/tools';
import type { Tool } from '@app-types/tool';

export interface UseToolSearchReturn {
  /** Current search query */
  query: string;
  /** Update the search query */
  setQuery: (q: string) => void;
  /** Filtered tools matching the query */
  results: Tool[];
  /** Whether a search is active (query is non-empty) */
  isSearching: boolean;
  /** Clear the search */
  clearSearch: () => void;
}

export function useToolSearch(): UseToolSearchReturn {
  const [query, setQuery] = useState('');

  const isSearching = query.trim().length > 0;

  const results = useMemo(() => {
    if (!isSearching) return [];

    const normalizedQuery = query.trim().toLowerCase();

    return TOOLS.filter((tool) => {
      const nameMatch = tool.name.toLowerCase().includes(normalizedQuery);
      const descMatch = tool.description.toLowerCase().includes(normalizedQuery);
      const categoryMatch = tool.category.toLowerCase().includes(normalizedQuery);
      return nameMatch || descMatch || categoryMatch;
    });
  }, [query, isSearching]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return { query, setQuery, results, isSearching, clearSearch };
}

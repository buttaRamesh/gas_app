import { useState, useEffect, useMemo } from 'react';

export interface UseSearchOptions<T> {
  /** Array of items to search */
  items: T[];
  /** Function to extract searchable text from each item */
  searchKeys: (item: T) => string[];
  /** Initial search query */
  initialQuery?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

export interface UseSearchReturn<T> {
  /** Current search query */
  query: string;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Filtered items based on search query */
  filteredItems: T[];
  /** Whether search is active (query is not empty) */
  isSearching: boolean;
}

/**
 * Custom hook for search/filter functionality
 * Eliminates repetitive search logic across list pages
 *
 * @example
 * ```tsx
 * const { query, setQuery, filteredItems } = useSearch({
 *   items: products,
 *   searchKeys: (product) => [product.name, product.description],
 * });
 *
 * <PageHeader
 *   showSearch
 *   searchValue={query}
 *   onSearchChange={setQuery}
 * />
 *
 * {filteredItems.map(product => ...)}
 * ```
 */
export function useSearch<T>({
  items,
  searchKeys,
  initialQuery = '',
  debounceMs = 0,
}: UseSearchOptions<T>): UseSearchReturn<T> {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    if (debounceMs === 0) {
      setDebouncedQuery(query);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim().toLowerCase();

    if (!trimmedQuery) {
      return items;
    }

    return items.filter((item) => {
      const searchableText = searchKeys(item).join(' ').toLowerCase();
      return searchableText.includes(trimmedQuery);
    });
  }, [items, debouncedQuery, searchKeys]);

  const isSearching = debouncedQuery.trim().length > 0;

  return {
    query,
    setQuery,
    filteredItems,
    isSearching,
  };
}

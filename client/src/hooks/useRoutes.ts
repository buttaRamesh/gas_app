import { useState, useEffect } from 'react';
import { routesApi } from '../services/api';
import type { Route } from '../types/routes';

export interface UseRoutesOptions {
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
  /** Filter to only unassigned routes */
  unassignedOnly?: boolean;
  /** Filter to only assigned routes */
  assignedOnly?: boolean;
}

export interface UseRoutesReturn {
  /** All routes */
  routes: Route[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch routes data */
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage routes data
 * Consolidates routes fetching logic used across route management pages
 *
 * @example
 * ```tsx
 * // Fetch all routes
 * const { routes, loading } = useRoutes();
 *
 * // Fetch only unassigned routes
 * const { routes, loading } = useRoutes({ unassignedOnly: true });
 * ```
 */
export function useRoutes(options: UseRoutesOptions = {}): UseRoutesReturn {
  const { autoFetch = true, unassignedOnly = false, assignedOnly = false } = options;

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Helper function to extract results from paginated or array response
   */
  const extractResults = <T,>(data: any): T[] => {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    return [];
  };

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await routesApi.getAll();
      let allRoutes = extractResults<Route>(response.data);

      // Apply filters
      if (unassignedOnly) {
        allRoutes = allRoutes.filter((route) => !route.delivery_person);
      } else if (assignedOnly) {
        allRoutes = allRoutes.filter((route) => route.delivery_person);
      }

      setRoutes(allRoutes);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
      setError(err as Error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchRoutes();
    }
  }, [autoFetch, unassignedOnly, assignedOnly]);

  return {
    routes,
    loading,
    error,
    refetch: fetchRoutes,
  };
}

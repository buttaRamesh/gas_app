import { useState, useEffect } from 'react';
import {
  consumersApi,
  connectionTypesApi,
  productsApi,
  consumerCategoriesApi,
  consumerTypesApi,
  bplTypesApi,
  dctTypesApi,
  schemesApi,
  routesApi,
} from '../services/api';
import type {
  ConsumerCategory,
  ConsumerType,
  BPLType,
  DCTType,
  Scheme,
} from '../types/consumers';

interface LookupItem {
  id: number;
  name: string;
}

interface RouteItem {
  id: number;
  area_code: string;
  area_code_description: string;
}

export interface UseConsumerLookupsOptions {
  /** Whether to fetch connection types */
  includeConnectionTypes?: boolean;
  /** Whether to fetch products */
  includeProducts?: boolean;
  /** Whether to fetch routes */
  includeRoutes?: boolean;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

export interface UseConsumerLookupsReturn {
  // Consumer specific lookups
  categories: ConsumerCategory[];
  types: ConsumerType[];
  bplTypes: BPLType[];
  dctTypes: DCTType[];
  schemes: Scheme[];

  // Optional lookups
  connectionTypes: LookupItem[];
  products: LookupItem[];
  routes: Array<{ id: number; name: string }>;

  // State
  loading: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch all consumer-related lookup data
 * Consolidates lookup fetching logic used in ConsumerDetail, ConsumerCreate, ConsumerEdit
 *
 * @example
 * ```tsx
 * const { categories, types, loading } = useConsumerLookups({
 *   includeProducts: true,
 *   includeRoutes: true,
 * });
 * ```
 */
export function useConsumerLookups(
  options: UseConsumerLookupsOptions = {}
): UseConsumerLookupsReturn {
  const {
    includeConnectionTypes = false,
    includeProducts = false,
    includeRoutes = false,
    autoFetch = true,
  } = options;

  const [categories, setCategories] = useState<ConsumerCategory[]>([]);
  const [types, setTypes] = useState<ConsumerType[]>([]);
  const [bplTypes, setBplTypes] = useState<BPLType[]>([]);
  const [dctTypes, setDctTypes] = useState<DCTType[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [connectionTypes, setConnectionTypes] = useState<LookupItem[]>([]);
  const [products, setProducts] = useState<LookupItem[]>([]);
  const [routes, setRoutes] = useState<Array<{ id: number; name: string }>>([]);

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

  const fetchLookups = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build array of promises based on what's needed
      const promises: Promise<any>[] = [
        consumerCategoriesApi.getAll(),
        consumerTypesApi.getAll(),
        bplTypesApi.getAll(),
        dctTypesApi.getAll(),
        schemesApi.getAll(),
      ];

      if (includeConnectionTypes) {
        promises.push(connectionTypesApi.getAll());
      }
      if (includeProducts) {
        promises.push(productsApi.getAll());
      }
      if (includeRoutes) {
        promises.push(routesApi.getAll());
      }

      const responses = await Promise.all(promises);

      // Always fetch these
      setCategories(extractResults(responses[0].data));
      setTypes(extractResults(responses[1].data));
      setBplTypes(extractResults(responses[2].data));
      setDctTypes(extractResults(responses[3].data));
      setSchemes(extractResults(responses[4].data));

      // Conditionally set optional lookups
      let responseIndex = 5;

      if (includeConnectionTypes) {
        setConnectionTypes(extractResults(responses[responseIndex].data));
        responseIndex++;
      }

      if (includeProducts) {
        setProducts(extractResults(responses[responseIndex].data));
        responseIndex++;
      }

      if (includeRoutes) {
        const routesData = extractResults<RouteItem>(responses[responseIndex].data);
        setRoutes(
          routesData.map((route) => ({
            id: route.id,
            name: `${route.area_code} - ${route.area_code_description}`,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch lookup data:', err);
      setError(err as Error);

      // Set empty arrays on error to prevent map errors
      setCategories([]);
      setTypes([]);
      setBplTypes([]);
      setDctTypes([]);
      setSchemes([]);
      setConnectionTypes([]);
      setProducts([]);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchLookups();
    }
  }, [autoFetch, includeConnectionTypes, includeProducts, includeRoutes]);

  return {
    categories,
    types,
    bplTypes,
    dctTypes,
    schemes,
    connectionTypes,
    products,
    routes,
    loading,
    error,
    refetch: fetchLookups,
  };
}

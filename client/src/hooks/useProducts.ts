import { useState, useEffect } from 'react';
import { productsApi, unitsApi } from '../services/api';
import type { Product, Unit } from '../types/products';

export interface UseProductsOptions {
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
  /** Whether to include units */
  includeUnits?: boolean;
  /** Specific product ID to fetch */
  productId?: number;
}

export interface UseProductsReturn {
  /** All products */
  products: Product[];
  /** Units (if includeUnits is true) */
  units: Unit[];
  /** Single product (if productId is specified) */
  product: Product | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch products data */
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage products data
 * Consolidates products fetching logic used across product management pages
 *
 * @example
 * ```tsx
 * // Fetch all products
 * const { products, loading } = useProducts();
 *
 * // Fetch products with units for form dropdowns
 * const { products, units, loading } = useProducts({ includeUnits: true });
 *
 * // Fetch a specific product
 * const { product, loading } = useProducts({ productId: 1 });
 * ```
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    autoFetch = true,
    includeUnits = false,
    productId,
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises: Promise<any>[] = [];

      // Fetch specific product or all products
      if (productId) {
        promises.push(productsApi.getById(productId));
      } else {
        promises.push(productsApi.getAll());
      }

      // Fetch units if requested
      if (includeUnits) {
        promises.push(unitsApi.getAll());
      }

      const responses = await Promise.all(promises);
      let responseIndex = 0;

      // Handle product/products response
      if (productId) {
        setProduct(responses[responseIndex].data);
        responseIndex++;
      } else {
        setProducts(extractResults(responses[responseIndex].data));
        responseIndex++;
      }

      // Handle units response
      if (includeUnits) {
        setUnits(extractResults(responses[responseIndex].data));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err as Error);

      // Set empty arrays/null on error to prevent map errors
      setProducts([]);
      setUnits([]);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, includeUnits, productId]);

  return {
    products,
    units,
    product,
    loading,
    error,
    refetch: fetchProducts,
  };
}

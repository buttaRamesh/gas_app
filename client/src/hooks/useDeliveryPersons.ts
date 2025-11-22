import { useState, useEffect } from 'react';
import { deliveryPersonsApi } from '../services/api';
import type { DeliveryPerson } from '../types/routes';

export interface UseDeliveryPersonsOptions {
  /** Whether to auto-fetch on mount */
  autoFetch?: boolean;
  /** Specific delivery person ID to fetch */
  personId?: number;
}

export interface UseDeliveryPersonsReturn {
  /** All delivery persons */
  deliveryPersons: DeliveryPerson[];
  /** Single delivery person (if personId is specified) */
  person: DeliveryPerson | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch delivery persons data */
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage delivery persons data
 * Consolidates delivery persons fetching logic used across delivery management pages
 *
 * @example
 * ```tsx
 * // Fetch all delivery persons
 * const { deliveryPersons, loading } = useDeliveryPersons();
 *
 * // Fetch a specific delivery person
 * const { person, loading } = useDeliveryPersons({ personId: 1 });
 * ```
 */
export function useDeliveryPersons(
  options: UseDeliveryPersonsOptions = {}
): UseDeliveryPersonsReturn {
  const { autoFetch = true, personId } = options;

  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [person, setPerson] = useState<DeliveryPerson | null>(null);
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

  const fetchDeliveryPersons = async () => {
    try {
      setLoading(true);
      setError(null);

      if (personId) {
        // Fetch specific delivery person
        const response = await deliveryPersonsApi.getById(personId);
        setPerson(response.data);
      } else {
        // Fetch all delivery persons
        const response = await deliveryPersonsApi.getAll();
        setDeliveryPersons(extractResults(response.data));
      }
    } catch (err) {
      console.error('Failed to fetch delivery persons:', err);
      setError(err as Error);

      // Set empty arrays/null on error to prevent map errors
      setDeliveryPersons([]);
      setPerson(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchDeliveryPersons();
    }
  }, [autoFetch, personId]);

  return {
    deliveryPersons,
    person,
    loading,
    error,
    refetch: fetchDeliveryPersons,
  };
}

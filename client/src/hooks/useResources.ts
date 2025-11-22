import { useState, useEffect } from 'react';
import { resourcesApi } from '@/services/api';
import { ResourceDetail } from '@/types/auth';

/**
 * Hook to fetch and cache available resources from the backend
 *
 * @param activeOnly - If true, only fetch active resources (default: true)
 * @returns Object with resources array, loading state, error, and refresh function
 *
 * @example
 * const { resources, loading, error, refresh } = useResources();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return (
 *   <ul>
 *     {resources.map(resource => (
 *       <li key={resource.id}>{resource.display_name}</li>
 *     ))}
 *   </ul>
 * );
 */
export const useResources = (activeOnly: boolean = true) => {
  const [resources, setResources] = useState<ResourceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeOnly) {
        // Fetch only active resources
        const response = await resourcesApi.getActive();
        setResources(response.data);
      } else {
        // Fetch all resources (paginated)
        const response = await resourcesApi.getAll();
        setResources(response.data.results || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch resources:', err);
      setError(err.response?.data?.message || 'Failed to fetch resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [activeOnly]);

  return {
    resources,
    loading,
    error,
    refresh: fetchResources,
  };
};

/**
 * Hook to get a specific resource by name
 *
 * @param resourceName - The internal resource name (e.g., "consumers", "routes")
 * @returns The resource object or undefined if not found
 *
 * @example
 * const consumersResource = useResource('consumers');
 *
 * if (consumersResource) {
 *   console.log(consumersResource.display_name); // "Consumers"
 * }
 */
export const useResource = (resourceName: string) => {
  const { resources, loading, error } = useResources();

  const resource = resources.find(r => r.name === resourceName);

  return {
    resource,
    loading,
    error,
  };
};

/**
 * Hook to get resource names as a map for quick lookup
 *
 * @returns Object with resourceMap, loading state, and error
 *
 * @example
 * const { resourceMap, loading } = useResourceMap();
 *
 * const displayName = resourceMap['consumers']?.display_name; // "Consumers"
 */
export const useResourceMap = () => {
  const { resources, loading, error } = useResources();

  const resourceMap = resources.reduce((acc, resource) => {
    acc[resource.name] = resource;
    return acc;
  }, {} as Record<string, ResourceDetail>);

  return {
    resourceMap,
    loading,
    error,
  };
};

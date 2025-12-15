/**
 * usePageTitle - Generates smart page titles based on endpoint
 *
 * Determines appropriate title for exports and prints based on
 * the current endpoint and resource type
 */
import { useMemo } from 'react';

interface UsePageTitleOptions {
  endpoint: string;
  resource: string;
}

/**
 * Generates context-aware page title for the current view
 */
export function usePageTitle({ endpoint, resource }: UsePageTitleOptions): string {
  return useMemo(() => {
    // KYC-specific titles
    if (endpoint.includes('kyc')) {
      // Check if showing done or pending KYC
      if (endpoint.includes('kyc=on') || endpoint.includes('kyc_status=done')) {
        return 'Consumers KYC Done';
      } else {
        return 'Consumers KYC Pending';
      }
    }

    // Consumer-specific titles
    if (endpoint.includes('consumers')) {
      return 'Consumer List';
    }

    // Route-specific titles
    if (endpoint.includes('routes')) {
      return 'Route List';
    }

    // Generic fallback: capitalize resource name
    return resource.charAt(0).toUpperCase() + resource.slice(1) + ' List';
  }, [endpoint, resource]);
}

/**
 * API Helper Utilities
 *
 * Common utilities for working with API responses and requests
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Default pagination settings
 */
export const PAGINATION = {
  /** Default page size for paginated lists */
  DEFAULT_PAGE_SIZE: 20,
  /** Page size options for user selection */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100,
  /** Default starting page */
  DEFAULT_PAGE: 1,
} as const;

/**
 * Common API query parameter keys
 */
export const QUERY_PARAMS = {
  PAGE: 'page',
  PAGE_SIZE: 'page_size',
  SEARCH: 'search',
  ORDERING: 'ordering',
  LIMIT: 'limit',
  OFFSET: 'offset',
} as const;

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ============================================================================
// Response Extraction Utilities
// ============================================================================

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  data?: T;
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * Extracts results array from various API response structures
 *
 * Handles different response formats:
 * - Direct array: `[item1, item2, ...]`
 * - Paginated: `{ results: [...], count: 10 }`
 * - Wrapped in data: `{ data: [...] }` or `{ data: { results: [...] } }`
 * - Nested: `{ data: { data: [...] } }`
 *
 * @param response - API response from axios or fetch
 * @returns Extracted array of items
 *
 * @example
 * ```typescript
 * // Direct array response
 * const users = extractResults({ data: [user1, user2] });
 * // users = [user1, user2]
 *
 * // Paginated response
 * const users = extractResults({ data: { results: [user1, user2], count: 2 } });
 * // users = [user1, user2]
 *
 * // Nested data
 * const users = extractResults({ data: { data: [user1, user2] } });
 * // users = [user1, user2]
 * ```
 */
export function extractResults<T = any>(response: any): T[] {
  if (!response) return [];

  // If response is already an array, return it
  if (Array.isArray(response)) {
    return response;
  }

  // Check response.data first (axios response)
  const data = response.data || response;

  // If data is an array, return it
  if (Array.isArray(data)) {
    return data;
  }

  // Check for paginated structure with results array
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }

  // Check for nested data.data structure
  if (data.data) {
    // If data.data is an array, return it
    if (Array.isArray(data.data)) {
      return data.data;
    }

    // If data.data has results, return results
    if (data.data.results && Array.isArray(data.data.results)) {
      return data.data.results;
    }

    // If data.data.data exists, try one more level
    if (data.data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
  }

  // If none of the above, return empty array
  return [];
}

/**
 * Extracts single item from API response
 *
 * @param response - API response
 * @returns Extracted item or null
 *
 * @example
 * ```typescript
 * const user = extractData<User>({ data: { id: 1, name: 'John' } });
 * // user = { id: 1, name: 'John' }
 * ```
 */
export function extractData<T = any>(response: any): T | null {
  if (!response) return null;

  // Check response.data first (axios response)
  const data = response.data || response;

  // If data is an object (not array), return it
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // Skip paginated response structures
    if ('results' in data || 'count' in data) {
      return null;
    }
    return data;
  }

  return null;
}

/**
 * Extracts pagination metadata from API response
 *
 * @param response - API response
 * @returns Pagination metadata
 *
 * @example
 * ```typescript
 * const pagination = extractPagination(response);
 * // { count: 100, next: 'url', previous: null, hasNext: true, hasPrevious: false }
 * ```
 */
export function extractPagination(response: any): {
  count: number;
  next: string | null;
  previous: string | null;
  hasNext: boolean;
  hasPrevious: boolean;
} {
  const data = response?.data || response || {};

  return {
    count: data.count || 0,
    next: data.next || null,
    previous: data.previous || null,
    hasNext: !!data.next,
    hasPrevious: !!data.previous,
  };
}

// ============================================================================
// Query Parameter Utilities
// ============================================================================

/**
 * Builds query parameters for paginated requests
 *
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Query parameters object
 *
 * @example
 * ```typescript
 * const params = buildPaginationParams(2, 20);
 * // { page: 2, page_size: 20 }
 * ```
 */
export function buildPaginationParams(
  page: number = PAGINATION.DEFAULT_PAGE,
  pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
): Record<string, string> {
  return {
    [QUERY_PARAMS.PAGE]: String(page),
    [QUERY_PARAMS.PAGE_SIZE]: String(Math.min(pageSize, PAGINATION.MAX_PAGE_SIZE)),
  };
}

/**
 * Builds search query parameters
 *
 * @param search - Search term
 * @returns Query parameters object or empty object if search is empty
 *
 * @example
 * ```typescript
 * const params = buildSearchParams('john');
 * // { search: 'john' }
 * ```
 */
export function buildSearchParams(search?: string): Record<string, string> {
  if (!search || !search.trim()) return {};
  return { [QUERY_PARAMS.SEARCH]: search.trim() };
}

/**
 * Builds ordering (sorting) query parameters
 *
 * @param field - Field to order by
 * @param direction - Sort direction ('asc' or 'desc')
 * @returns Query parameters object
 *
 * @example
 * ```typescript
 * const params = buildOrderingParams('name', 'asc');
 * // { ordering: 'name' }
 *
 * const params = buildOrderingParams('created_at', 'desc');
 * // { ordering: '-created_at' }
 * ```
 */
export function buildOrderingParams(
  field: string,
  direction: 'asc' | 'desc' = 'asc'
): Record<string, string> {
  const orderingValue = direction === 'desc' ? `-${field}` : field;
  return { [QUERY_PARAMS.ORDERING]: orderingValue };
}

/**
 * Combines multiple parameter objects into URLSearchParams
 *
 * @param paramObjects - Multiple parameter objects to combine
 * @returns URLSearchParams instance
 *
 * @example
 * ```typescript
 * const params = combineParams(
 *   buildPaginationParams(2, 20),
 *   buildSearchParams('john'),
 *   { is_active: 'true' }
 * );
 * // URLSearchParams with: page=2&page_size=20&search=john&is_active=true
 * ```
 */
export function combineParams(...paramObjects: Record<string, any>[]): URLSearchParams {
  const params = new URLSearchParams();

  for (const obj of paramObjects) {
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    }
  }

  return params;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Checks if response is paginated
 *
 * @param response - API response
 * @returns True if response has pagination structure
 */
export function isPaginatedResponse(response: any): response is PaginatedResponse<any> {
  const data = response?.data || response;
  return (
    data &&
    typeof data === 'object' &&
    'results' in data &&
    Array.isArray(data.results) &&
    'count' in data &&
    typeof data.count === 'number'
  );
}

/**
 * Checks if response is an error
 *
 * @param response - API response
 * @returns True if response is an error
 */
export function isErrorResponse(response: any): boolean {
  return (
    response?.isAxiosError ||
    response?.error ||
    response?.status >= 400 ||
    response?.data?.error
  );
}

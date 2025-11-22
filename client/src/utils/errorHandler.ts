/**
 * Error handling utilities
 * Extracts meaningful error messages from API responses
 */

import { AxiosError } from 'axios';

/**
 * Error response structure from Django REST Framework
 */
interface DjangoErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
  non_field_errors?: string[];
  [key: string]: any; // Field-specific errors
}

/**
 * Extracts a user-friendly error message from an API error
 * @param error - The error object from axios or other sources
 * @returns A meaningful error message string
 */
export function getErrorMessage(error: unknown): string {
  // Handle axios errors
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<DjangoErrorResponse>;

    // Network errors
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return 'Request timeout. Please check your internet connection and try again.';
      }
      if (axiosError.message === 'Network Error') {
        return 'Network error. Please check your internet connection.';
      }
      return 'Unable to connect to the server. Please try again later.';
    }

    const { status, data } = axiosError.response;

    // Try to extract the actual error message from Django first
    const djangoError = extractDjangoError(data);

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return djangoError || extractValidationErrors(data) || 'Invalid request. Please check your input.';

      case 401:
        return djangoError || 'Session expired. Please log in again.';

      case 403:
        return djangoError || 'You do not have permission to perform this action.';

      case 404:
        return djangoError || 'The requested resource was not found.';

      case 409:
        return djangoError || 'A conflict occurred. The resource may already exist.';

      case 422:
        return djangoError || extractValidationErrors(data) || 'Validation failed. Please check your input.';

      case 429:
        return djangoError || 'Too many requests. Please wait a moment and try again.';

      case 500:
        return djangoError || 'Server error. Please try again later.';

      case 502:
      case 503:
      case 504:
        return djangoError || 'Service temporarily unavailable. Please try again in a few moments.';

      default:
        // Always try to extract the actual error message
        return djangoError || `An error occurred (${status}). Please try again.`;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extracts the actual error message from Django response
 * This function comprehensively checks all common Django error formats
 * @param data - Error response data
 * @returns Error message string or null
 */
function extractDjangoError(data: any): string | null {
  if (!data) return null;

  // Handle string responses (sometimes Django sends plain text)
  if (typeof data === 'string') {
    return data;
  }

  if (typeof data !== 'object') return null;

  // Check for common Django error fields in order of preference
  // 1. detail (most common in DRF)
  if (data.detail) {
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) return data.detail.join('. ');
    if (typeof data.detail === 'object' && data.detail.message) return data.detail.message;
  }

  // 2. message
  if (data.message) {
    if (typeof data.message === 'string') return data.message;
    if (Array.isArray(data.message)) return data.message.join('. ');
  }

  // 3. error
  if (data.error) {
    if (typeof data.error === 'string') return data.error;
    if (Array.isArray(data.error)) return data.error.join('. ');
    if (typeof data.error === 'object' && data.error.message) return data.error.message;
  }

  // 4. errors (plural - sometimes used for validation)
  if (data.errors) {
    if (typeof data.errors === 'string') return data.errors;
    if (Array.isArray(data.errors)) return data.errors.join('. ');
  }

  // 5. non_field_errors
  if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
    return data.non_field_errors.join('. ');
  }

  // 6. Check if the entire response is an array of error strings
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
    return data.join('. ');
  }

  return null;
}

/**
 * Extracts validation errors from Django REST Framework error response
 * @param data - Error response data
 * @returns Formatted validation error message or null
 */
function extractValidationErrors(data: DjangoErrorResponse): string | null {
  if (!data || typeof data !== 'object') return null;

  // First, check for simple top-level error messages
  if (data.detail && typeof data.detail === 'string') {
    return data.detail;
  }
  if (data.message && typeof data.message === 'string') {
    return data.message;
  }
  if (data.error && typeof data.error === 'string') {
    return data.error;
  }

  // Handle non_field_errors array
  if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
    return data.non_field_errors.join('. ');
  }

  // Handle field-specific errors
  const fieldErrors: string[] = [];

  for (const [field, value] of Object.entries(data)) {
    // Skip metadata fields
    if (['status', 'statusText', 'config', 'headers', 'request'].includes(field)) {
      continue;
    }

    // Skip if we already handled these above
    if (['detail', 'message', 'error', 'non_field_errors'].includes(field)) {
      continue;
    }

    // Handle array of error messages
    if (Array.isArray(value)) {
      const errorMessages = value
        .filter(msg => typeof msg === 'string')
        .map(msg => `${formatFieldName(field)}: ${msg}`);
      fieldErrors.push(...errorMessages);
    }
    // Handle object errors (nested validation)
    else if (typeof value === 'object' && value !== null) {
      const nestedErrors = extractNestedErrors(field, value);
      fieldErrors.push(...nestedErrors);
    }
    // Handle string errors
    else if (typeof value === 'string') {
      fieldErrors.push(`${formatFieldName(field)}: ${value}`);
    }
  }

  if (fieldErrors.length > 0) {
    // Limit to first 3 errors to avoid overwhelming the user
    const displayErrors = fieldErrors.slice(0, 3);
    const remaining = fieldErrors.length - displayErrors.length;

    let message = displayErrors.join('; ');
    if (remaining > 0) {
      message += ` (and ${remaining} more error${remaining > 1 ? 's' : ''})`;
    }
    return message;
  }

  return null;
}

/**
 * Extracts errors from nested validation objects
 * @param parentField - Parent field name
 * @param obj - Nested error object
 * @returns Array of formatted error messages
 */
function extractNestedErrors(parentField: string, obj: any): string[] {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = `${formatFieldName(parentField)}.${formatFieldName(key)}`;

    if (Array.isArray(value)) {
      value.forEach(msg => {
        if (typeof msg === 'string') {
          errors.push(`${fieldPath}: ${msg}`);
        }
      });
    } else if (typeof value === 'string') {
      errors.push(`${fieldPath}: ${value}`);
    }
  }

  return errors;
}

/**
 * Formats field names to be more user-friendly
 * @param field - Field name from API (e.g., "phone_number")
 * @returns Formatted field name (e.g., "Phone Number")
 */
function formatFieldName(field: string): string {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Logs errors to console in development mode
 * @param error - Error to log
 * @param context - Additional context about where the error occurred
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.group(`🔴 Error${context ? ` in ${context}` : ''}`);
    console.error('Error object:', error);

    // Log axios error details
    if (error instanceof Error && 'isAxiosError' in error) {
      const axiosError = error as AxiosError;
      console.error('Status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
      console.error('Config:', {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        params: axiosError.config?.params,
        data: axiosError.config?.data,
      });
    }

    // Log the extracted message
    const extractedMessage = getErrorMessage(error);
    console.error('Extracted message:', extractedMessage);

    console.groupEnd();
  }
}

/**
 * Determines if an error is a network error
 * @param error - Error to check
 * @returns True if it's a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return !axiosError.response && axiosError.message === 'Network Error';
  }
  return false;
}

/**
 * Determines if an error is an authentication error
 * @param error - Error to check
 * @returns True if it's an auth error (401 or 403)
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401 || axiosError.response?.status === 403;
  }
  return false;
}

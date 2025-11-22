/**
 * Hook for handling async operations with automatic error handling
 * Provides consistent error notifications and loading states
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getErrorMessage, logError } from '@/utils/errorHandler';

interface AsyncOperationOptions {
  /**
   * Success message to display (optional)
   */
  successMessage?: string;

  /**
   * Error message prefix (will be combined with extracted error)
   */
  errorPrefix?: string;

  /**
   * Whether to show toast notifications
   * @default { success: true, error: true }
   */
  showToast?: {
    success?: boolean;
    error?: boolean;
  };

  /**
   * Callback to run on success
   */
  onSuccess?: () => void;

  /**
   * Callback to run on error
   */
  onError?: (error: unknown) => void;

  /**
   * Context for error logging (helps with debugging)
   */
  logContext?: string;
}

interface AsyncOperationResult<T> {
  /**
   * Execute the async operation
   */
  execute: (operation: () => Promise<T>) => Promise<T | null>;

  /**
   * Whether the operation is currently loading
   */
  loading: boolean;

  /**
   * The last error that occurred (if any)
   */
  error: string | null;

  /**
   * Clear the error state
   */
  clearError: () => void;

  /**
   * Reset all state (loading and error)
   */
  reset: () => void;
}

/**
 * Hook for handling async operations with automatic error handling
 *
 * @example
 * ```tsx
 * const { execute, loading } = useAsyncOperation({
 *   successMessage: 'User created successfully',
 *   errorPrefix: 'Failed to create user',
 * });
 *
 * const handleSubmit = async (data) => {
 *   const result = await execute(() => usersApi.create(data));
 *   if (result) {
 *     navigate('/users');
 *   }
 * };
 * ```
 */
export function useAsyncOperation<T = any>(
  options: AsyncOperationOptions = {}
): AsyncOperationResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    successMessage,
    errorPrefix,
    showToast = { success: true, error: true },
    onSuccess,
    onError,
    logContext,
  } = options;

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operation();

        // Show success notification if configured
        if (successMessage && showToast.success !== false) {
          toast.success(successMessage);
        }

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        return result;
      } catch (err) {
        // Extract meaningful error message
        const errorMessage = getErrorMessage(err);
        const fullErrorMessage = errorPrefix
          ? `${errorPrefix}: ${errorMessage}`
          : errorMessage;

        setError(fullErrorMessage);

        // Log error in development
        logError(err, logContext);

        // Show error notification if configured
        if (showToast.error !== false) {
          toast.error(fullErrorMessage);
        }

        // Call error callback
        if (onError) {
          onError(err);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [successMessage, errorPrefix, showToast, onSuccess, onError, logContext]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    execute,
    loading,
    error,
    clearError,
    reset,
  };
}

/**
 * Hook for handling multiple async operations independently
 *
 * @example
 * ```tsx
 * const operations = useAsyncOperations({
 *   save: { successMessage: 'Saved successfully' },
 *   delete: { successMessage: 'Deleted successfully' },
 * });
 *
 * await operations.save.execute(() => api.save(data));
 * await operations.delete.execute(() => api.delete(id));
 * ```
 */
export function useAsyncOperations<T extends Record<string, AsyncOperationOptions>>(
  configs: T
): Record<keyof T, AsyncOperationResult<any>> {
  const operations = {} as Record<keyof T, AsyncOperationResult<any>>;

  for (const key in configs) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    operations[key] = useAsyncOperation(configs[key]);
  }

  return operations;
}

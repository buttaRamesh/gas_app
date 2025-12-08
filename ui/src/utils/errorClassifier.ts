export type NormalizedError = {
  status: number;
  message: string;
  errors?: Record<string, string[]> | null;
};

export const classifyError = (error: NormalizedError) => {
  const { status } = error;

  return {
    isNetworkError: status === 0,
    isAuthError: status === 401,
    isForbidden: status === 403,
    isNotFound: status === 404,
    isValidationError: status === 422,
    isServerError: status >= 500,
  };
};

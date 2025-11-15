/**
 * Get the API base URL based on environment
 */
export const getApiBaseUrl = (): string => {
  // In development, use proxy (relative paths work)
  if (import.meta.env.DEV) {
    return '';
  }

  // In production, use the custom domain
  return 'https://api.safety-companion.com';
};

/**
 * Create a full API URL
 */
export const createApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
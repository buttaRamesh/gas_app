/**
 * extractResource - Extracts resource name from endpoint URL
 *
 * Examples:
 *   /consumers/          -> 'consumers'
 *   /routes/active/      -> 'routes'
 *   /consumers/kyc/      -> 'consumers'
 */
export function extractResource(endpoint: string): string {
  const cleanedPath = endpoint.replace(/^\/|\/$/g, '');
  const parts = cleanedPath.split('/');
  return parts[0] || 'unknown';
}

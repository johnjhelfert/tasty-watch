/**
 * Centralized API configuration
 * Handles environment variables and provides consistent API endpoints
 */

export const apiConfig = {
  /**
   * Get API base URL (use in server-side API routes)
   */
  getApiUrl: () => import.meta.env.VITE_TASTYTRADE_API_URL || 'https://api.cert.tastyworks.com'
};
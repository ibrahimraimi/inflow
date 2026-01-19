/**
 * Get the base URL for the application based on the environment
 * - Development: http://localhost:3000
 * - Production: Uses NEXT_PUBLIC_APP_URL or falls back to production domain
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side
    return window.location.origin;
  }

  // Server-side
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  // Production
  return process.env.NEXT_PUBLIC_APP_URL || "https://inflow.studio21.studio";
}

/**
 * Get the API base URL for making API calls
 */
export function getApiUrl(): string {
  return getBaseUrl();
}

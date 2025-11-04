/**
 * Utility function to get the base URL for the backend
 * Supports both local development and production environments
 */
export const getBaseUrl = () => {
  // Use BACKEND_URL if provided (required for production)
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  
  // For production, BACKEND_URL should always be set
  // Fallback for development only
  if (process.env.NODE_ENV === 'production') {
    console.warn('WARNING: BACKEND_URL not set in production. Using fallback.');
    // This fallback may not work correctly in production
    return `http://localhost:${process.env.PORT || 8080}`;
  }
  
  // For local development
  return `http://localhost:${process.env.PORT || 8080}`;
};

/**
 * Get the frontend URL for CORS and redirects
 */
export const getFrontendUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:5173';
};

/**
 * Normalize a URL path (adds base URL if path is relative)
 */
export const normalizeUrl = (path) => {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Otherwise, prepend the base URL
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};


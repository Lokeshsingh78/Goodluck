/**
 * Centralized API Configuration for Good Luck Society Frontend.
 * Uses Vite Environment Variable VITE_API_URL if configured (e.g. https://goodluck-society.onrender.com),
 * falling back to empty string for relative paths in local development via Vite proxy.
 */

export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Constructs a full API endpoint URL or relative URL.
 * @param {string} endpoint - API path, e.g. '/api/products'
 * @returns {string} Full URL or relative endpoint
 */
export const getApiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Resolves full asset or image URL for items hosted on backend or externally.
 * @param {string} path - Image path or URL
 * @returns {string} Full image URL or relative path
 */
export const getImageUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

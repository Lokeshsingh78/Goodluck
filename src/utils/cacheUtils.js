/**
 * Client-Side Caching & Preloading Utilities
 */

const CACHE_PREFIX = 'goodluck_cache_';

/**
 * Save data to localStorage with a timestamp and TTL (default 10 minutes).
 */
export const setLocalCache = (key, data, ttlSeconds = 600) => {
  try {
    const payload = {
      timestamp: Date.now(),
      ttlMs: ttlSeconds * 1000,
      data
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to write local cache:', err);
  }
};

/**
 * Retrieve cached data from localStorage.
 * Returns { data, isStale } if found, or null if not found.
 */
export const getLocalCache = (key) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    const age = Date.now() - payload.timestamp;
    const isStale = age > payload.ttlMs;

    return {
      data: payload.data,
      isStale,
      age
    };
  } catch (err) {
    return null;
  }
};

/**
 * Remove a cached entry from localStorage.
 */
export const removeLocalCache = (key) => {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (err) {}
};

/**
 * Asynchronously preload images into browser cache so UI renders instantly.
 */
const preloadedUrls = new Set();

export const preloadImages = (urls = []) => {
  if (!Array.isArray(urls)) return;

  urls.forEach((url) => {
    if (!url || preloadedUrls.has(url)) return;

    preloadedUrls.add(url);
    const img = new Image();
    img.src = url;
  });
};

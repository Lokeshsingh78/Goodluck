import crypto from 'crypto';

// In-memory cache store
const cacheStore = new Map();

/**
 * Middleware to cache GET API requests for a specified duration (TTL in seconds).
 * Also sets Cache-Control and ETag headers.
 */
export const cacheMiddleware = (ttlSeconds = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on URL and query params
    const cacheKey = req.originalUrl || req.url;
    const cachedItem = cacheStore.get(cacheKey);
    const now = Date.now();

    if (cachedItem && cachedItem.expiry > now) {
      // Check If-None-Match ETag header for 304 Not Modified
      const clientEtag = req.headers['if-none-match'];
      if (clientEtag && clientEtag === cachedItem.etag) {
        res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=120`);
        return res.status(304).end();
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=120`);
      res.setHeader('ETag', cachedItem.etag);
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).send(cachedItem.body);
    }

    // Intercept res.send / res.json to capture response body
    const originalSend = res.send.bind(res);
    res.send = (body) => {
      if (res.statusCode === 200) {
        const stringified = typeof body === 'string' ? body : JSON.stringify(body);
        const etag = `"${crypto.createHash('md5').update(stringified).digest('hex')}"`;
        
        cacheStore.set(cacheKey, {
          body,
          etag,
          expiry: now + ttlSeconds * 1000
        });

        res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=120`);
        res.setHeader('ETag', etag);
        res.setHeader('X-Cache', 'MISS');
      }
      return originalSend(body);
    };

    next();
  };
};

/**
 * Invalidate cache keys matching a prefix or pattern.
 */
export const clearCache = (prefix = '') => {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.includes(prefix)) {
      cacheStore.delete(key);
    }
  }
};

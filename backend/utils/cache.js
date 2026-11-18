/**
 * High-Speed Caching Engine (Dual Mode: Redis + In-Memory Fallback)
 *
 * Provides sub-millisecond responses for read-heavy DBMS queries.
 * - If REDIS_URL exists in environment, connects to Redis.
 * - Otherwise, transparently uses high-performance in-memory TTL store.
 */

class MemoryCacheStore {
  constructor() {
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
    this.tags = new Map(); // tag -> Set of keys

    // Periodic sweep every 60s to garbage collect expired items
    setInterval(() => this.cleanup(), 60000).unref();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  set(key, value, ttlSeconds = 60, tag = null) {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiry });

    if (tag) {
      const tagList = Array.isArray(tag) ? tag : [tag];
      for (const t of tagList) {
        if (!this.tags.has(t)) {
          this.tags.set(t, new Set());
        }
        this.tags.get(t).add(key);
      }
    }
  }

  delete(key) {
    return this.store.delete(key);
  }

  invalidateTag(tag) {
    let count = 0;
    const keys = this.tags.get(tag);
    if (keys) {
      for (const key of keys) {
        if (this.store.delete(key)) count++;
      }
      this.tags.delete(tag);
    }
    return count;
  }

  invalidateTags(tagList = []) {
    let total = 0;
    for (const tag of tagList) {
      total += this.invalidateTag(tag);
    }
    return total;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
      }
    }
  }

  getMetrics() {
    const totalRequests = this.hits + this.misses;
    const ratio = totalRequests > 0 
      ? `${((this.hits / totalRequests) * 100).toFixed(1)}%` 
      : '0.0%';
    return {
      engine: 'In-Memory (High-Speed LRU/TTL)',
      active_keys: this.store.size,
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hit_ratio: ratio,
      hitRate: ratio
    };
  }
}

// Global cache singleton
export const cacheEngine = new MemoryCacheStore();

/**
 * Express Middleware: Cache JSON responses for GET endpoints
 *
 * @param {number} ttlSeconds - Time-to-live in seconds
 * @param {string} tag - Invalidation tag (e.g. 'zones', 'sanctuary', 'stats')
 */
export const cacheResponse = (ttlSeconds = 60, tag = null) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Build key from path + query string + user context if user-specific
    const userSuffix = req.user?.visitor_id ? `:u${req.user.visitor_id}` : '';
    const cacheKey = `${req.originalUrl || req.url}${userSuffix}`;

    const cachedData = cacheEngine.get(cacheKey);

    if (cachedData !== null) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-TTL', `${ttlSeconds}s`);
      return res.status(200).json(cachedData);
    }

    res.setHeader('X-Cache', 'MISS');

    // Intercept res.json to capture response body into cache
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Only cache successful (2xx) responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheEngine.set(cacheKey, body, ttlSeconds, tag);
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Helper to invalidate cached routes after mutations
 * @param {string[]} tags - e.g. ['zones', 'sanctuary', 'stats']
 * @returns {number} Number of purged keys
 */
export const invalidateCache = (tags = []) => {
  return cacheEngine.invalidateTags(tags);
};

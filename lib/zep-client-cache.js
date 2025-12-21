// lib/zep-client-cache.js
// LRU Cache implementation for Zep AI Client
// Optimizes repeated API calls with intelligent caching

/**
 * LRU Cache Node
 * @private
 */
class CacheNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.timestamp = Date.now();
    this.prev = null;
    this.next = null;
  }
}

/**
 * LRU Cache for Zep AI Client
 * Implements Least Recently Used eviction policy
 * Performance: O(1) for get/set operations
 */
class ZepClientLRUCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100; // Maximum cache entries
    this.ttl = options.ttl || 5 * 60 * 1000; // Default: 5 minutes TTL
    
    this.cache = new Map(); // Key -> CacheNode mapping
    this.head = null; // Most recently used
    this.tail = null; // Least recently used
    this.size = 0;

    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0
    };
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   * Performance: O(1)
   */
  get(key) {
    const node = this.cache.get(key);
    
    if (!node) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (this._isExpired(node)) {
      this.delete(key);
      this.stats.expirations++;
      this.stats.misses++;
      return null;
    }

    // Move to front (most recently used)
    this._moveToFront(node);
    this.stats.hits++;
    
    return node.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * Performance: O(1)
   */
  set(key, value) {
    // Update existing node
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      node.value = value;
      node.timestamp = Date.now();
      this._moveToFront(node);
      return;
    }

    // Create new node
    const node = new CacheNode(key, value);
    this.cache.set(key, node);
    this._addToFront(node);
    this.size++;

    // Evict LRU if cache is full
    if (this.size > this.maxSize) {
      this._evictLRU();
    }
  }

  /**
   * Delete entry from cache
   * @param {string} key - Cache key
   * @returns {boolean} True if deleted
   * Performance: O(1)
   */
  delete(key) {
    const node = this.cache.get(key);
    if (!node) return false;

    this._removeNode(node);
    this.cache.delete(key);
    this.size--;
    return true;
  }

  /**
   * Clear entire cache
   * Performance: O(1)
   */
  clear() {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /**
   * Get cache statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      size: this.size,
      maxSize: this.maxSize,
      hitRate: `${hitRate}%`,
      ttl: `${this.ttl / 1000}s`
    };
  }

  /**
   * Check if node is expired
   * @private
   */
  _isExpired(node) {
    return Date.now() - node.timestamp > this.ttl;
  }

  /**
   * Move node to front (most recently used)
   * @private
   */
  _moveToFront(node) {
    if (node === this.head) return;

    this._removeNode(node);
    this._addToFront(node);
  }

  /**
   * Add node to front of list
   * @private
   */
  _addToFront(node) {
    node.next = this.head;
    node.prev = null;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  /**
   * Remove node from list
   * @private
   */
  _removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  /**
   * Evict least recently used entry
   * @private
   */
  _evictLRU() {
    if (!this.tail) return;

    const lruKey = this.tail.key;
    this._removeNode(this.tail);
    this.cache.delete(lruKey);
    this.size--;
    this.stats.evictions++;
  }
}

/**
 * Create cache key from function name and arguments
 * @param {string} functionName - Function name
 * @param {Array} args - Function arguments
 * @returns {string} Cache key
 */
function createCacheKey(functionName, args) {
  return `${functionName}:${JSON.stringify(args)}`;
}

/**
 * Wrap Zep client method with caching
 * @param {Object} zepClient - Zep client instance
 * @param {string} methodName - Method name to wrap
 * @param {ZepClientLRUCache} cache - Cache instance
 * @returns {Function} Wrapped method
 */
function cacheZepMethod(zepClient, methodName, cache) {
  const originalMethod = zepClient[methodName];
  
  return async function(...args) {
    const cacheKey = createCacheKey(methodName, args);
    
    // Try cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }

    // Call original method
    const result = await originalMethod.apply(zepClient, args);
    
    // Cache result
    cache.set(cacheKey, result);
    
    return result;
  };
}

// Create global cache instance
const zepCache = new ZepClientLRUCache({
  maxSize: 100,
  ttl: 5 * 60 * 1000 // 5 minutes
});

export { ZepClientLRUCache, zepCache, cacheZepMethod, createCacheKey };

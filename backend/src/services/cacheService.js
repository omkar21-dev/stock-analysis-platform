class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live for each cache entry
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0
    };
    this.defaultTTL = 60000; // 1 minute default TTL
    this.maxSize = 1000; // Maximum cache size
    
    // Clean expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanExpired();
    }, 5 * 60 * 1000);

    console.log('CacheService initialized with in-memory storage');
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      // Check cache size limit
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        this.evictOldest();
      }

      this.cache.set(key, {
        value,
        createdAt: Date.now(),
        accessCount: 0
      });
      this.ttl.set(key, Date.now() + ttl);
      this.stats.sets++;
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      if (!this.cache.has(key)) {
        this.stats.misses++;
        return null;
      }

      const expiry = this.ttl.get(key);
      if (Date.now() > expiry) {
        this.cache.delete(key);
        this.ttl.delete(key);
        this.stats.misses++;
        return null;
      }

      const entry = this.cache.get(key);
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      
      this.stats.hits++;
      return entry.value;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }

  async delete(key) {
    try {
      const deleted = this.cache.delete(key) && this.ttl.delete(key);
      if (deleted) {
        this.stats.deletes++;
      }
      return deleted;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async clear() {
    try {
      this.cache.clear();
      this.ttl.clear();
      this.stats.deletes += this.cache.size;
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  cleanExpired() {
    try {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, expiry] of this.ttl.entries()) {
        if (now > expiry) {
          this.cache.delete(key);
          this.ttl.delete(key);
          cleaned++;
        }
      }
      
      this.stats.cleanups++;
      if (cleaned > 0) {
        console.log(`Cache cleanup: removed ${cleaned} expired entries`);
      }
      
      return cleaned;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }

  evictOldest() {
    try {
      let oldestKey = null;
      let oldestTime = Date.now();
      
      for (const [key, entry] of this.cache.entries()) {
        if (entry.createdAt < oldestTime) {
          oldestTime = entry.createdAt;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.delete(oldestKey);
        console.log(`Cache evicted oldest entry: ${oldestKey}`);
      }
    } catch (error) {
      console.error('Cache eviction error:', error);
    }
  }

  async getStatus() {
    try {
      const hitRate = this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
        : 0;

      return {
        connected: true,
        type: 'in-memory',
        size: this.cache.size,
        maxSize: this.maxSize,
        hitRate: `${hitRate}%`,
        stats: {
          ...this.stats,
          totalOperations: this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes
        },
        memory: {
          used: Math.round(JSON.stringify([...this.cache.entries()]).length / 1024),
          unit: 'KB'
        }
      };
    } catch (error) {
      console.error('Cache status error:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: `${hitRate}%`,
      ...this.stats,
      keys: Array.from(this.cache.keys()).slice(0, 10) // Show first 10 keys
    };
  }

  // Get cache entries with metadata
  getEntries(limit = 10) {
    const entries = [];
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (count >= limit) break;
      
      const expiry = this.ttl.get(key);
      entries.push({
        key,
        createdAt: new Date(entry.createdAt).toISOString(),
        lastAccessed: entry.lastAccessed ? new Date(entry.lastAccessed).toISOString() : null,
        accessCount: entry.accessCount,
        expiresAt: new Date(expiry).toISOString(),
        ttl: Math.max(0, expiry - Date.now())
      });
      count++;
    }
    
    return entries;
  }

  // Cleanup method for graceful shutdown
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    console.log('CacheService destroyed');
  }
}

module.exports = new CacheService();

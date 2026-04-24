interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
}

/**
 * Production-grade in-memory cache with TTL, stats, and stale-while-revalidate.
 */
class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private stats: CacheStats = { hits: 0, misses: 0, sets: 0, evictions: 0 };

  /**
   * Get a cached value. Returns null if expired or missing.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Get a cached value even if expired (stale data).
   * Useful for serving stale data while revalidating.
   */
  getStale<T>(key: string): { value: T; isStale: boolean } | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    const isStale = Date.now() > entry.expiresAt;
    return { value: entry.value, isStale };
  }

  /**
   * Set a value with TTL in milliseconds.
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });
    this.stats.sets++;
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete a specific key.
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all entries.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get the age of a cached entry in milliseconds.
   */
  getAge(key: string): number | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return Date.now() - entry.createdAt;
  }

  /**
   * Get cache statistics.
   */
  getStats(): CacheStats & { size: number; hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(1) + '%' : '0%';
    return {
      ...this.stats,
      size: this.store.size,
      hitRate,
    };
  }

  /**
   * Reset statistics.
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, evictions: 0 };
  }
}

// Singleton instance for the server-side cache
export const cache = new MemoryCache();

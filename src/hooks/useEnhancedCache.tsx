import { useState, useEffect } from 'react';

// Enhanced caching with compression and validation
interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
  compressed?: boolean;
}

interface CacheConfig {
  maxAge?: number;
  maxSize?: number;
  compress?: boolean;
  version?: string;
}

class EnhancedCache {
  private cache = new Map<string, CacheItem<any>>();
  private accessTimes = new Map<string, number>();
  private defaultConfig: Required<CacheConfig> = {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    compress: false,
    version: '1.0'
  };

  set<T>(key: string, data: T, config?: CacheConfig): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Clean up old entries if cache is full
    if (this.cache.size >= finalConfig.maxSize) {
      this.cleanup();
    }

    const cacheItem: CacheItem<T> = {
      data: finalConfig.compress ? this.compress(data) : data,
      timestamp: Date.now(),
      version: finalConfig.version,
      compressed: finalConfig.compress
    };

    this.cache.set(key, cacheItem);
    this.accessTimes.set(key, Date.now());
  }

  get<T>(key: string, config?: CacheConfig): T | null {
    const finalConfig = { ...this.defaultConfig, ...config };
    const item = this.cache.get(key);

    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > finalConfig.maxAge) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      return null;
    }

    // Check version compatibility
    if (item.version !== finalConfig.version) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      return null;
    }

    // Update access time
    this.accessTimes.set(key, Date.now());

    return item.compressed ? this.decompress(item.data) : item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.accessTimes.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
  }

  private cleanup(): void {
    // Remove oldest accessed items
    const sortedByAccess = Array.from(this.accessTimes.entries())
      .sort((a, b) => a[1] - b[1]);
    
    const toRemove = sortedByAccess.slice(0, Math.floor(this.cache.size * 0.3));
    toRemove.forEach(([key]) => {
      this.cache.delete(key);
      this.accessTimes.delete(key);
    });
  }

  private compress(data: any): string {
    try {
      return btoa(JSON.stringify(data));
    } catch {
      return JSON.stringify(data);
    }
  }

  private decompress(data: string): any {
    try {
      return JSON.parse(atob(data));
    } catch {
      return JSON.parse(data);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length,
      oldestItem: Math.min(...Array.from(this.accessTimes.values())),
      newestItem: Math.max(...Array.from(this.accessTimes.values()))
    };
  }
}

export const enhancedCache = new EnhancedCache();

export const useEnhancedCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  config?: CacheConfig
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get from cache first
        const cached = enhancedCache.get<T>(key, config);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch fresh data
        const freshData = await fetcher();
        enhancedCache.set(key, freshData, config);
        setData(freshData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  const invalidate = () => {
    enhancedCache.delete(key);
  };

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      enhancedCache.delete(key);
      
      const freshData = await fetcher();
      enhancedCache.set(key, freshData, config);
      setData(freshData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, invalidate, refresh };
};
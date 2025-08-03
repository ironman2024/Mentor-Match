interface CacheItem {
  value: any;
  expiry: number;
}

export class CacheService {
  private static cache = new Map<string, CacheItem>();
  private static DEFAULT_TTL = 300; // 5 minutes

  static async get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  static async set(key: string, value: any, ttl = this.DEFAULT_TTL) {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }

  static async invalidate(pattern: string) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

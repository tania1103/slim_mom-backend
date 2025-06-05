const NodeCache = require('node-cache');

// Create cache instances for different data types
const caches = {
  // Products cache - TTL 10 minutes
  products: new NodeCache({ 
    stdTTL: 600, 
    checkperiod: 120,
    maxKeys: 1000 
  }),
  
  // User profiles cache - TTL 5 minutes
  users: new NodeCache({ 
    stdTTL: 300, 
    checkperiod: 60,
    maxKeys: 500 
  }),
  
  // Search results cache - TTL 15 minutes
  search: new NodeCache({ 
    stdTTL: 900, 
    checkperiod: 180,
    maxKeys: 200 
  }),
  
  // Calorie calculations cache - TTL 30 minutes
  calculations: new NodeCache({ 
    stdTTL: 1800, 
    checkperiod: 300,
    maxKeys: 100 
  })
};

// Cache middleware factory
const createCacheMiddleware = (cacheType, keyGenerator, ttl = null) => {
  return (req, res, next) => {
    if (!caches[cacheType]) {
      return next();
    }
    
    const cacheKey = keyGenerator(req);
    const cachedData = caches[cacheType].get(cacheKey);
    
    if (cachedData) {
      console.log(`📋 Cache HIT: ${cacheType}:${cacheKey}`);
      return res.json(cachedData);
    }
    
    // Monkey patch res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      if (res.statusCode === 200 && data) {
        const cacheOptions = ttl ? { ttl } : {};
        caches[cacheType].set(cacheKey, data, cacheOptions);
        console.log(`💾 Cache SET: ${cacheType}:${cacheKey}`);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Specific cache middleware functions
const cacheProducts = createCacheMiddleware(
  'products',
  (req) => `products_${req.query.page || 1}_${req.query.limit || 20}`
);

const cacheSearch = createCacheMiddleware(
  'search',
  (req) => `search_${req.query.search}_${req.query.bloodType || 'all'}_${req.query.limit || 20}`
);

const cacheUserProfile = createCacheMiddleware(
  'users',
  (req) => `user_${req.user?.userId || req.params.id}`
);

const cacheCalorieCalculation = createCacheMiddleware(
  'calculations',
  (req) => {
    const { age, height, weight, bloodType } = req.body;
    return `calc_${age}_${height}_${weight}_${bloodType}`;
  }
);

// Cache management functions
const invalidateUserCache = (userId) => {
  const keys = caches.users.keys();
  keys.forEach(key => {
    if (key.includes(userId)) {
      caches.users.del(key);
    }
  });
};

const invalidateProductCache = () => {
  caches.products.flushAll();
  caches.search.flushAll();
};

const getCacheStats = () => {
  const stats = {};
  Object.keys(caches).forEach(cacheType => {
    const cache = caches[cacheType];
    stats[cacheType] = {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) * 100
    };
  });
  return stats;
};

// Cleanup function for graceful shutdown
const cleanup = () => {
  Object.values(caches).forEach(cache => cache.close());
};

module.exports = {
  caches,
  cacheProducts,
  cacheSearch,
  cacheUserProfile,
  cacheCalorieCalculation,
  invalidateUserCache,
  invalidateProductCache,
  getCacheStats,
  cleanup
};
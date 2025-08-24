const NodeCache = require('node-cache');

// Cache em memória para paginação
const paginationCache = new NodeCache({
  stdTTL: 300, // 5 minutos padrão
  checkperiod: 120,
  useClones: false
});
const config = require('../config');

class PaginationService {
  constructor() {
    this.defaultLimit = 10;
    this.maxLimit = 100;
  }

  generateCacheKey(baseKey, page, limit, filters = {}) {
    const filterString = Object.keys(filters).length > 0 
      ? `:${JSON.stringify(filters)}` 
      : '';
    return `${baseKey}:page:${page}:limit:${limit}${filterString}`;
  }

  validatePaginationParams(page, limit) {
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(
      this.maxLimit, 
      Math.max(1, parseInt(limit) || this.defaultLimit)
    );

    return {
      page: validatedPage,
      limit: validatedLimit,
      offset: (validatedPage - 1) * validatedLimit
    };
  }

  async paginateWithCache(data, page, limit, options = {}) {
    const {
      cacheKey = 'data',
      filters = {},
      ttl = config.cache.defaultTTL,
      enableCache = true
    } = options;

    const { page: validatedPage, limit: validatedLimit, offset } = 
      this.validatePaginationParams(page, limit);

    const cacheKeyFull = this.generateCacheKey(cacheKey, validatedPage, validatedLimit, filters);

    try {
      if (enableCache) {
        const cached = paginationCache.get(cacheKeyFull);
        if (cached) {
          return cached;
        }
      }

      const startTime = Date.now();

      let filteredData = data;
      if (Object.keys(filters).length > 0) {
        filteredData = this.applyFilters(data, filters);
      }

      const total = filteredData.length;
      const totalPages = Math.ceil(total / validatedLimit);

      const paginatedData = filteredData.slice(offset, offset + validatedLimit);

      const result = {
        data: paginatedData,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages,
          hasNext: validatedPage < totalPages,
          hasPrev: validatedPage > 1,
          nextPage: validatedPage < totalPages ? validatedPage + 1 : null,
          prevPage: validatedPage > 1 ? validatedPage - 1 : null
        },
        meta: {
          cached: false,
          queryTime: Date.now() - startTime
        }
      };

      if (enableCache) {
        paginationCache.set(cacheKeyFull, result, ttl);
      }

      return result;
    } catch (error) {
      console.error('❌ Erro na paginação com cache:', error.message);
      
      return this.simplePaginate(data, validatedPage, validatedLimit);
    }
  }

  simplePaginate(data, page, limit) {
    const { page: validatedPage, limit: validatedLimit, offset } = 
      this.validatePaginationParams(page, limit);

    const total = data.length;
    const totalPages = Math.ceil(total / validatedLimit);
    const paginatedData = data.slice(offset, offset + validatedLimit);

    return {
      data: paginatedData,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
        nextPage: validatedPage < totalPages ? validatedPage + 1 : null,
        prevPage: validatedPage > 1 ? validatedPage - 1 : null
      },
      meta: {
        cached: false,
        fallback: true
      }
    };
  }

  applyFilters(data, filters) {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (typeof value === 'string') {
          return item[key] && 
                 item[key].toString().toLowerCase().includes(value.toLowerCase());
        }
        if (typeof value === 'number') {
          return item[key] === value;
        }
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] === value;
      });
    });
  }

  async invalidatePaginationCache(baseKey, filters = {}) {
    try {
      const keys = paginationCache.keys();
      const pattern = this.generateCacheKey(baseKey, '*', '*', filters);
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      
      keys.forEach(key => {
        if (regex.test(key)) {
          paginationCache.del(key);
        }
      });
      
      console.log(`🗑️ Cache de paginação invalidado: ${pattern}`);
    } catch (error) {
      console.error('❌ Erro ao invalidar cache de paginação:', error.message);
    }
  }

  async getPaginationStats() {
    try {
      return {
        queries: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgQueryTime: 0
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de paginação:', error.message);
      return {
        queries: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgQueryTime: 0
      };
    }
  }

  generatePaginationLinks(baseUrl, pagination, queryParams = {}) {
    const { page, totalPages, hasNext, hasPrev, nextPage, prevPage } = pagination;
    
    const links = {
      self: this.buildUrl(baseUrl, page, queryParams),
      first: this.buildUrl(baseUrl, 1, queryParams),
      last: this.buildUrl(baseUrl, totalPages, queryParams)
    };

    if (hasPrev) {
      links.prev = this.buildUrl(baseUrl, prevPage, queryParams);
    }

    if (hasNext) {
      links.next = this.buildUrl(baseUrl, nextPage, queryParams);
    }

    return links;
  }

  buildUrl(baseUrl, page, queryParams) {
    const params = new URLSearchParams({
      page: page.toString(),
      ...queryParams
    });
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  }
}

const paginationService = new PaginationService();

module.exports = paginationService;

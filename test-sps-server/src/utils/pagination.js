const redisService = require('../services/redisService');
const config = require('../config');

class PaginationService {
  constructor() {
    this.defaultLimit = 10;
    this.maxLimit = 100;
  }

  // Gerar chave de cache para paginação
  generateCacheKey(baseKey, page, limit, filters = {}) {
    const filterString = Object.keys(filters).length > 0 
      ? `:${JSON.stringify(filters)}` 
      : '';
    return `${baseKey}:page:${page}:limit:${limit}${filterString}`;
  }

  // Validar e normalizar parâmetros de paginação
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

  // Paginar dados com cache otimizado
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
      // Tentar buscar do cache se habilitado
      if (enableCache) {
        const cached = await redisService.get(cacheKeyFull);
        if (cached) {
          await redisService.incrementMetric('pagination_cache_hits');
          return cached;
        }
      }

      const startTime = Date.now();

      // Aplicar filtros se fornecidos
      let filteredData = data;
      if (Object.keys(filters).length > 0) {
        filteredData = this.applyFilters(data, filters);
      }

      // Calcular totais
      const total = filteredData.length;
      const totalPages = Math.ceil(total / validatedLimit);

      // Aplicar paginação
      const paginatedData = filteredData.slice(offset, offset + validatedLimit);

      // Construir resultado
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

      // Cachear resultado se habilitado
      if (enableCache) {
        await redisService.set(cacheKeyFull, result, ttl);
        await redisService.incrementMetric('pagination_cache_misses');
      }

      // Registrar métricas de performance
      const duration = Date.now() - startTime;
      await redisService.incrementMetric('pagination_query_duration', duration);
      await redisService.incrementMetric('pagination_queries_total');

      return result;
    } catch (error) {
      console.error('❌ Erro na paginação com cache:', error.message);
      
      // Fallback para paginação simples
      return this.simplePaginate(data, validatedPage, validatedLimit);
    }
  }

  // Paginação simples (fallback)
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

  // Aplicar filtros aos dados
  applyFilters(data, filters) {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (typeof value === 'string') {
          // Busca case-insensitive
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

  // Invalidar cache de paginação
  async invalidatePaginationCache(baseKey, filters = {}) {
    try {
      const pattern = this.generateCacheKey(baseKey, '*', '*', filters);
      await redisService.del(pattern);
      console.log(`🗑️ Cache de paginação invalidado: ${pattern}`);
    } catch (error) {
      console.error('❌ Erro ao invalidar cache de paginação:', error.message);
    }
  }

  // Obter estatísticas de paginação
  async getPaginationStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      return {
        queries: await redisService.getMetric('pagination_queries_total', today),
        cacheHits: await redisService.getMetric('pagination_cache_hits', today),
        cacheMisses: await redisService.getMetric('pagination_cache_misses', today),
        avgQueryTime: await redisService.getMetric('pagination_query_duration', today)
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

  // Gerar links de paginação para API
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

  // Construir URL com parâmetros
  buildUrl(baseUrl, page, queryParams) {
    const params = new URLSearchParams({
      page: page.toString(),
      ...queryParams
    });
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  }
}

// Singleton instance
const paginationService = new PaginationService();

module.exports = paginationService;

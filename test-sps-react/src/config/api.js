// Configuração centralizada da API
const config = {
  // URL base da API do backend
  baseURL: process.env.REACT_APP_SERVER_URL || 'http://localhost:3000',
  
  // Timeout das requisições
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  
  // Configurações de cache
  cache: {
    enabled: process.env.REACT_APP_CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.REACT_APP_CACHE_TTL) || 300000, // 5 minutos
  },
  
  // Headers padrão
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints da API
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      stats: '/auth/stats',
    },
    users: {
      list: '/users',
      create: '/users',
      get: (id) => `/users/${id}`,
      update: (id) => `/users/${id}`,
      delete: (id) => `/users/${id}`,
    },
    metrics: {
      get: '/metrics',
    },
    docs: {
      swagger: '/docs',
    },
  },
  
  // Configurações de paginação
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },
  
  // Configurações de busca
  search: {
    minLength: 2,
    maxLength: 50,
  },
};

export default config;


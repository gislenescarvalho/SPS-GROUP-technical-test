const config = {
  baseURL: process.env.REACT_APP_SERVER_URL || 'http://localhost:3000',
  
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  
  cache: {
    enabled: process.env.REACT_APP_CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.REACT_APP_CACHE_TTL) || 300000,
  },
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
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
  
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },
  
  search: {
    minLength: 2,
    maxLength: 50,
  },
};

export default config;


const config = {
  baseURL: '',  // Usar proxy em desenvolvimento
  
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  
  apiVersion: process.env.REACT_APP_API_VERSION || 'v1',
  
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
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      stats: '/api/auth/stats',
      changePassword: '/api/auth/change-password',
      requestReset: '/api/auth/request-reset',
      resetPassword: '/api/auth/reset-password',
    },
    users: {
      list: '/api/users',
      create: '/api/users',
      get: (id) => `/api/users/${id}`,
      update: (id) => `/api/users/${id}`,
      delete: (id) => `/api/users/${id}`,
    },
    docs: {
      swagger: '/api/docs',
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


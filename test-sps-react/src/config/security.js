const securityConfig = {
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001'
    ],
    credentials: true
  },

  auth: {
    tokenExpiry: 24 * 60 * 60 * 1000,
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000
  },

  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommonPasswords: true,
      preventSequentialChars: true,
      preventRepeatedChars: true
    },
    email: {
      maxLength: 255,
      allowSubdomains: true
    },
    input: {
      maxLength: 1000,
      sanitizeHtml: true
    }
  },

  rateLimit: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000,
    skipSuccessfulRequests: false
  },

  logging: {
    enabled: true,
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    securityEvents: true,
    userActions: true,
    apiCalls: process.env.NODE_ENV === 'development'
  },

  headers: {
    contentSecurityPolicy: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", "data:", "https:"],
      'connect-src': ["'self'", "http://localhost:3000", "https://localhost:3000"],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"]
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },

  storage: {
    encryption: process.env.NODE_ENV === 'production',
    prefix: 'sps_secure_',
    sensitiveKeys: ['token', 'refreshToken', 'user']
  },

  session: {
    timeout: 30 * 60 * 1000,
    extendOnActivity: true,
    secureOnly: process.env.NODE_ENV === 'production'
  },

  monitoring: {
    enabled: true,
    trackErrors: true,
    trackPerformance: true,
    trackUserActions: false,
    anonymizeData: true
  },

  backup: {
    autoBackup: false,
    backupInterval: 24 * 60 * 60 * 1000,
    maxBackups: 7
  }
};

export const securityUtils = {
  isAllowedOrigin: (origin) => {
    return securityConfig.cors.allowedOrigins.includes(origin);
  },

  generateSecureToken: (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  validatePasswordStrength: (password) => {
    const config = securityConfig.validation.password;
    const errors = [];

    if (password.length < config.minLength) {
      errors.push(`Senha deve ter pelo menos ${config.minLength} caracteres`);
    }
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }
    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, 100 - (errors.length * 20))
    };
  },

  sanitizeSensitiveData: (data) => {
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        if (securityConfig.storage.sensitiveKeys.includes(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = typeof value === 'object' ? 
            securityUtils.sanitizeSensitiveData(value) : value;
        }
      }
      return sanitized;
    }
    return data;
  },

  isSecureEnvironment: () => {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost';
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      // Verificar se o token tem o formato correto de JWT (3 partes separadas por ponto)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token não está no formato JWT correto');
        return true;
      }
      
      // Decodificar o payload (segunda parte do JWT)
      const payload = JSON.parse(atob(parts[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      
      // Adicionar margem de segurança de 5 minutos
      const safetyMargin = 5 * 60 * 1000; // 5 minutos
      
      return now >= (expiry - safetyMargin);
    } catch (error) {
      console.warn('Erro ao decodificar token:', error);
      return true;
    }
  },

  getTokenTimeRemaining: (token) => {
    if (!token) return 0;
    
    try {
      // Verificar se o token tem o formato correto de JWT (3 partes separadas por ponto)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token não está no formato JWT correto');
        return 0;
      }
      
      // Decodificar o payload (segunda parte do JWT)
      const payload = JSON.parse(atob(parts[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      
      // Adicionar margem de segurança de 5 minutos
      const safetyMargin = 5 * 60 * 1000; // 5 minutos
      
      return Math.max(0, (expiry - safetyMargin) - now);
    } catch (error) {
      console.warn('Erro ao decodificar token:', error);
      return 0;
    }
  }
};

export default securityConfig;


// Configuração de segurança para o frontend

const securityConfig = {
  // Configurações de CORS
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001'
    ],
    credentials: true
  },

  // Configurações de autenticação
  auth: {
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 dias
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutos
  },

  // Configurações de validação
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
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

  // Configurações de rate limiting
  rateLimit: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutos
    skipSuccessfulRequests: false
  },

  // Configurações de logging
  logging: {
    enabled: true,
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    securityEvents: true,
    userActions: true,
    apiCalls: process.env.NODE_ENV === 'development'
  },

  // Configurações de headers de segurança
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
      maxAge: 31536000, // 1 ano
      includeSubDomains: true,
      preload: true
    }
  },

  // Configurações de armazenamento seguro
  storage: {
    encryption: process.env.NODE_ENV === 'production',
    prefix: 'sps_secure_',
    sensitiveKeys: ['token', 'refreshToken', 'user']
  },

  // Configurações de sessão
  session: {
    timeout: 30 * 60 * 1000, // 30 minutos
    extendOnActivity: true,
    secureOnly: process.env.NODE_ENV === 'production'
  },

  // Configurações de monitoramento
  monitoring: {
    enabled: true,
    trackErrors: true,
    trackPerformance: true,
    trackUserActions: false, // Privacidade
    anonymizeData: true
  },

  // Configurações de backup e recuperação
  backup: {
    autoBackup: false,
    backupInterval: 24 * 60 * 60 * 1000, // 24 horas
    maxBackups: 7
  }
};

// Funções de utilidade de segurança
export const securityUtils = {
  // Verificar se a origem é permitida
  isAllowedOrigin: (origin) => {
    return securityConfig.cors.allowedOrigins.includes(origin);
  },

  // Gerar token seguro
  generateSecureToken: (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Validar força da senha
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

  // Sanitizar dados sensíveis
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

  // Verificar se está em ambiente seguro
  isSecureEnvironment: () => {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost';
  },

  // Verificar se o token está expirado
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Converter para milissegundos
      return Date.now() >= expiry;
    } catch {
      return true;
    }
  },

  // Calcular tempo restante do token
  getTokenTimeRemaining: (token) => {
    if (!token) return 0;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Math.max(0, expiry - Date.now());
    } catch {
      return 0;
    }
  }
};

export default securityConfig;


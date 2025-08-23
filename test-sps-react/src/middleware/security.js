// Middleware de segurança para o frontend React

/**
 * Validação de entrada para prevenir XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remover caracteres perigosos
  return input
    .replace(/[<>]/g, '') // Remover < e >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
};

/**
 * Validação de email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validação de senha forte
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      length: password.length < minLength ? `Senha deve ter pelo menos ${minLength} caracteres` : null,
      uppercase: !hasUpperCase ? 'Senha deve conter pelo menos uma letra maiúscula' : null,
      lowercase: !hasLowerCase ? 'Senha deve conter pelo menos uma letra minúscula' : null,
      numbers: !hasNumbers ? 'Senha deve conter pelo menos um número' : null,
      special: !hasSpecialChar ? 'Senha deve conter pelo menos um caractere especial' : null
    }
  };
};

/**
 * Sanitização de dados antes de enviar para API
 */
export const sanitizeData = (data) => {
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }
  
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  return data;
};

/**
 * Validação de URL segura
 */
export const validateUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Prevenção de CSRF - Gerar token único
 */
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Validação de headers de segurança
 */
export const validateSecurityHeaders = (headers) => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection'
  ];
  
  const missingHeaders = requiredHeaders.filter(header => !headers[header]);
  
  if (missingHeaders.length > 0) {
    console.warn('⚠️ Headers de segurança ausentes:', missingHeaders);
    return false;
  }
  
  return true;
};

/**
 * Log de eventos de segurança
 */
export const logSecurityEvent = (event, details) => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Em produção, enviar para serviço de logging
  if (process.env.NODE_ENV === 'production') {
    // Implementar envio para serviço de logging
    console.log('🔒 Security Event:', securityLog);
  } else {
    console.log('🔒 Security Event:', securityLog);
  }
};

/**
 * Detecção de tentativas de XSS
 */
export const detectXSSAttempt = (input) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Validação de dados de entrada
 */
export const validateInput = (input, type = 'string') => {
  switch (type) {
    case 'email':
      return validateEmail(input);
    case 'password':
      return validatePassword(input);
    case 'url':
      return validateUrl(input);
    case 'string':
    default:
      return !detectXSSAttempt(input);
  }
};

/**
 * Configuração de segurança para localStorage
 */
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : JSON.stringify(value);
      localStorage.setItem(key, sanitizedValue);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      logSecurityEvent('storage_error', { key, error: error.message });
    }
  },
  
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? sanitizeInput(value) : null;
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
      logSecurityEvent('storage_error', { key, error: error.message });
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
      logSecurityEvent('storage_error', { key, error: error.message });
    }
  }
};

/**
 * Middleware de segurança para requisições
 */
export const securityMiddleware = {
  beforeRequest: (config) => {
    // Sanitizar dados antes de enviar
    if (config.data) {
      config.data = sanitizeData(config.data);
    }
    
    // Adicionar headers de segurança
    config.headers = {
      ...config.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': generateCSRFToken()
    };
    
    return config;
  },
  
  afterResponse: (response) => {
    // Validar headers de segurança da resposta
    validateSecurityHeaders(response.headers);
    
    // Log de resposta suspeita
    if (response.status >= 400) {
      logSecurityEvent('api_error', {
        status: response.status,
        url: response.config?.url,
        method: response.config?.method
      });
    }
    
    return response;
  },
  
  onError: (error) => {
    // Log de erros de segurança
    if (error.response?.status === 403) {
      logSecurityEvent('forbidden_access', {
        url: error.config?.url,
        method: error.config?.method
      });
    }
    
    if (error.response?.status === 401) {
      logSecurityEvent('unauthorized_access', {
        url: error.config?.url,
        method: error.config?.method
      });
    }
    
    return error;
  }
};

export default {
  sanitizeInput,
  validateEmail,
  validatePassword,
  sanitizeData,
  validateUrl,
  generateCSRFToken,
  validateSecurityHeaders,
  logSecurityEvent,
  detectXSSAttempt,
  validateInput,
  secureStorage,
  securityMiddleware
};

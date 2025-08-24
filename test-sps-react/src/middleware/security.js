import { securityUtils } from '../config/security';

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar;
};

export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token) => {
  return token && token.length === 64 && /^[a-f0-9]+$/i.test(token);
};

export const secureStorage = {
  setItem: (key, value) => {
    try {
      const encryptedValue = btoa(JSON.stringify(value));
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Erro ao salvar dados seguros:', error);
    }
  },
  
  getItem: (key) => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      return JSON.parse(atob(encryptedValue));
    } catch (error) {
      console.error('Erro ao recuperar dados seguros:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover dados seguros:', error);
    }
  }
};

export const validateSecurityHeaders = (headers) => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection'
  ];
  
  return requiredHeaders.every(header => 
    headers[header] && headers[header].length > 0
  );
};

export const logSecurityEvent = (eventType, data = {}) => {
  const securityEvent = {
    type: eventType,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...data
  };
  
  console.warn('Evento de Segurança:', securityEvent);
  
  if (process.env.NODE_ENV === 'production') {
    try {
      fetch('/api/security/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': generateCSRFToken()
        },
        body: JSON.stringify(securityEvent)
      }).catch(error => {
        console.error('Erro ao enviar log de segurança:', error);
      });
    } catch (error) {
      console.error('Erro ao processar log de segurança:', error);
    }
  }
};

export const validateInput = (input, rules = {}) => {
  const {
    required = false,
    minLength = 0,
    maxLength = Infinity,
    pattern = null,
    customValidator = null
  } = rules;
  
  if (required && (!input || input.trim().length === 0)) {
    return { isValid: false, error: 'Campo obrigatório' };
  }
  
  if (input && input.length < minLength) {
    return { isValid: false, error: `Mínimo de ${minLength} caracteres` };
  }
  
  if (input && input.length > maxLength) {
    return { isValid: false, error: `Máximo de ${maxLength} caracteres` };
  }
  
  if (pattern && input && !pattern.test(input)) {
    return { isValid: false, error: 'Formato inválido' };
  }
  
  if (customValidator && input) {
    const customResult = customValidator(input);
    if (!customResult.isValid) {
      return customResult;
    }
  }
  
  return { isValid: true };
};

export const sanitizeData = (data) => {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }
  
  return data;
};

export const validateRequest = (requestData) => {
  const sanitizedData = sanitizeData(requestData);
  
  const validationResult = {
    isValid: true,
    errors: [],
    sanitizedData
  };
  
  if (!sanitizedData) {
    validationResult.isValid = false;
    validationResult.errors.push('Dados da requisição inválidos');
  }
  
  return validationResult;
};

export const addSecurityHeaders = (headers = {}) => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    ...headers
  };
};

export const validateResponse = (response) => {
  if (!response) {
    logSecurityEvent('response_validation_failed', { reason: 'Resposta vazia' });
    return false;
  }
  
  if (response.status >= 400) {
    logSecurityEvent('response_error', { 
      status: response.status,
      statusText: response.statusText 
    });
  }
  
  const headers = response.headers;
  if (!validateSecurityHeaders(headers)) {
    logSecurityEvent('security_headers_missing', { headers: Object.keys(headers) });
  }
  
  return true;
};

export const handleSecurityError = (error, context = {}) => {
  const securityError = {
    message: error.message,
    type: error.name,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack
  };
  
  logSecurityEvent('security_error', securityError);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Erro de Segurança:', securityError);
  }
  
  return {
    error: 'Erro de segurança detectado',
    details: process.env.NODE_ENV === 'development' ? securityError : undefined
  };
};

export const securityMiddleware = {
  beforeRequest: (config) => {
    config = sanitizeData(config);
    config.headers = addSecurityHeaders(config.headers);
    return config;
  },
  
  afterResponse: (response) => {
    validateResponse(response);
    return response;
  },
  
  onError: (error) => {
    logSecurityEvent('request_error', { 
      error: error.message,
      url: error.config?.url,
      method: error.config?.method 
    });
    return error;
  }
};

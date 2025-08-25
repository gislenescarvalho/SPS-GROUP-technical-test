

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
  
  // Verificar senhas comuns que devem ser evitadas
  const commonPasswords = [
    '1234', '12345', '123456', '1234567', '12345678', '123456789', '1234567890',
    'password', 'senha', 'admin', 'user', 'test', 'qwerty', 'abc123',
    'admin123', 'user123', 'test123', 'password123', 'senha123'
  ];
  
  const isCommonPassword = commonPasswords.includes(password.toLowerCase());
  
  // Verificar caracteres sequenciais (mais permissivo)
  const hasSequentialChars = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);
  
  // Verificar caracteres repetidos (mais permissivo)
  const hasRepeatedChars = /(.)\1{3,}/.test(password);
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar &&
         !isCommonPassword &&
         !hasSequentialChars &&
         !hasRepeatedChars;
};

export const generateCSRFToken = () => {
  // Para desenvolvimento, usar timestamp + random simples
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const validateCSRFToken = (token) => {
  return token && token.length === 64 && /^[a-f0-9]+$/i.test(token);
};

export const secureStorage = {
  setItem: (key, value) => {
    try {
      // Armazenar apenas dados essenciais para evitar inflação
      let stringValue;
      
      if (key === 'user') {
        // Para usuário, armazenar dados essenciais incluindo o nome
        const essentialUserData = {
          id: value.id,
          name: value.name,
          email: value.email,
          type: value.type
        };
        stringValue = JSON.stringify(essentialUserData);
      } else {
        stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      }
      
      const encryptedValue = btoa(stringValue);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Erro ao salvar dados seguros:', error);
    }
  },
  
  getItem: (key) => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      // Verificar se o valor está codificado em base64
      try {
        const decodedValue = atob(encryptedValue);
        // Tentar fazer parse JSON, se falhar, retornar como string
        try {
          return JSON.parse(decodedValue);
        } catch (parseError) {
          return decodedValue;
        }
      } catch (decodeError) {
        // Se falhar ao decodificar, pode ser que o valor não esteja codificado
        // Tentar usar o valor diretamente
        console.warn(`Valor para ${key} não está codificado em base64, usando valor direto`);
        try {
          return JSON.parse(encryptedValue);
        } catch (parseError) {
          return encryptedValue;
        }
      }
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
  },
  
  // Função para limpar todos os dados e evitar inflação
  clearAll: () => {
    try {
      const keys = ['token', 'refreshToken', 'user'];
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erro ao limpar dados seguros:', error);
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
  // Não registrar eventos de segurança para operações bem-sucedidas
  if (eventType === 'login_success' || eventType === 'logout_success' || eventType === 'token_refresh_success') {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Evento de Segurança:', { type: eventType, ...data });
    }
    return;
  }

  // Não registrar eventos de UI para erros que não são de segurança
  if (eventType === 'ui_error' && data.message === 'Erro ao fazer login') {
    // Verificar se é realmente um erro de segurança ou apenas um erro de UI
    if (data.variant === 'error' && !data.securityRelated) {
      return; // Não registrar erros de UI comuns
    }
  }

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
  // Headers mínimos essenciais para reduzir tamanho
  const essentialHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Adicionar Authorization apenas se existir
  if (headers['Authorization']) {
    essentialHeaders['Authorization'] = headers['Authorization'];
  }
  
  return essentialHeaders;
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

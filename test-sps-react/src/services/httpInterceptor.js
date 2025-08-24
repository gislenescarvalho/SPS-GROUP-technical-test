import axios from 'axios';
import config from '../config/api';
import { securityMiddleware, logSecurityEvent, secureStorage } from '../middleware/security';
import { securityUtils } from '../config/security';

// Instância do axios configurada
const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: config.headers,
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue = [];
let retryCount = 0;
const MAX_RETRIES = 3;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Função para verificar se é um erro de rede
const isNetworkError = (error) => {
  return !error.response && (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED');
};

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {

    
    // Limpar dados antigos periodicamente para evitar inflação
    const lastCleanup = localStorage.getItem('last_cleanup');
    const now = Date.now();
    if (!lastCleanup || (now - parseInt(lastCleanup)) > 3600000) { // 1 hora
      secureStorage.clearAll();
      localStorage.setItem('last_cleanup', now.toString());
    }
    
    // Aplicar middleware de segurança
    config = securityMiddleware.beforeRequest(config);
    
    // Verificar se o token está expirado antes de fazer a requisição
    const token = secureStorage.getItem('token');
    if (token && securityUtils.isTokenExpired(token)) {
      // Permitir requisições de logout mesmo com token expirado
      if (config.url && config.url.includes('/api/auth/logout')) {
        // Para logout, não bloquear mesmo com token expirado
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Logout com token expirado:', { url: config.url, method: config.method });
        }
      } else {
        logSecurityEvent('request_with_expired_token', { 
          url: config.url,
          method: config.method 
        });
        
        // Limpar token expirado
        secureStorage.removeItem('token');
        secureStorage.removeItem('refreshToken');
        secureStorage.removeItem('user');
        
        // Disparar evento de logout para notificar outros componentes
        window.dispatchEvent(new CustomEvent('auth:logout', {
          detail: {
            timestamp: Date.now(),
            reason: 'token_expired'
          }
        }));
        
        return Promise.reject(new Error('Token expirado'));
      }
    }
    
    // Adicionar token de autenticação se existir (evitar duplicação)
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Adicionar apenas headers essenciais para reduzir tamanho
    if (!config.headers['X-API-Version']) {
      config.headers['X-API-Version'] = 'v1'; // Valor fixo para reduzir tamanho
    }
    
    // Removido: X-Request-Timestamp para reduzir headers
    
    // Log de requisição para auditoria (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      const headerCount = Object.keys(config.headers).length;
      const headerSize = JSON.stringify(config.headers).length;
      
      // Log simplificado para melhor performance
      console.log('🔒 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headerCount,
              headerSize: `${headerSize} bytes`
      });
      
      // Avisar se os headers estão muito grandes
      if (headerSize > 8000) {
        console.warn('⚠️ Headers muito grandes detectados:', headerSize, 'bytes');
      }
    }
    

    
    return config;
  },
  (error) => {
    // Apenas registrar erros de requisição como eventos de segurança se forem críticos
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      logSecurityEvent('request_error', { error: error.message });
    }
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // Resetar contador de retry em caso de sucesso
    retryCount = 0;
    
    // Aplicar middleware de segurança na resposta
    return securityMiddleware.afterResponse(response);
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Aplicar middleware de segurança no erro
    error = securityMiddleware.onError(error);
    
    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está tentando renovar, adicionar à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Verificar se há refresh token
        const refreshToken = secureStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('Refresh token não encontrado');
        }

        // Verificar se o refresh token não está expirado
        if (securityUtils.isTokenExpired(refreshToken)) {
          throw new Error('Refresh token expirado');
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Tentativa de renovação de token:', { 
            url: originalRequest.url,
            method: originalRequest.method 
          });
        }

        // Tentar renovar o token
        const response = await axios.post(`${config.baseURL}/api/auth/refresh`, {
          refreshToken,
        }, {
          timeout: 10000, // Timeout específico para refresh
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const { accessToken: token, refreshToken: newRefreshToken } = response.data.data || response.data;
        
        // Validar se os novos tokens não estão expirados
        if (securityUtils.isTokenExpired(token)) {
          throw new Error('Novo token já está expirado');
        }
        
        // Atualizar tokens no localStorage de forma segura
        secureStorage.setItem('token', token);
        secureStorage.setItem('refreshToken', newRefreshToken);
        
        // Atualizar header da requisição original
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Processar fila de requisições pendentes
        processQueue(null, token);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Token renovado com sucesso:', { 
            url: originalRequest.url,
            method: originalRequest.method 
          });
        }
        
        // Repetir a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, limpar todos os dados de autenticação
        secureStorage.removeItem('token');
        secureStorage.removeItem('refreshToken');
        secureStorage.removeItem('user');
        
        // Limpar dados de sessão
        sessionStorage.clear();
        
        // Processar fila de requisições pendentes com erro
        processQueue(refreshError, null);
        
        // Log do erro de refresh
        logSecurityEvent('token_refresh_failed', { 
          error: refreshError.message,
          url: originalRequest.url 
        });
        
        // Disparar evento de logout para notificar outros componentes
        window.dispatchEvent(new CustomEvent('auth:logout', {
          detail: {
            timestamp: Date.now(),
            reason: 'refresh_failed'
          }
        }));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Tratar erros de rede com retry automático
    if (isNetworkError(error) && retryCount < MAX_RETRIES) {
      retryCount++;
      const delay = Math.pow(2, retryCount) * 1000; // Backoff exponencial
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Retry de rede:', { 
          retryCount,
          delay,
          url: originalRequest.url 
        });
      }
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, delay);
      });
    }
    
    // Tratar outros erros com mensagens consistentes
    const errorMessages = {
      400: 'Dados inválidos. Verifique as informações enviadas.',
      401: 'Não autorizado. Faça login novamente.',
      403: 'Acesso negado. Você não tem permissão para acessar este recurso.',
      404: 'Recurso não encontrado. Verifique a URL ou o ID informado.',
      409: 'Conflito. O recurso já existe ou está em uso.',
      422: 'Dados inválidos. Verifique os campos obrigatórios.',
      429: 'Muitas requisições. Tente novamente em alguns minutos.',
      500: 'Erro interno do servidor. Tente novamente mais tarde.',
      502: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
      503: 'Serviço em manutenção. Tente novamente mais tarde.',
      504: 'Timeout do servidor. Tente novamente em alguns minutos.'
    };
    
    const statusCode = error.response?.status;
    const defaultMessage = 'Erro inesperado. Tente novamente mais tarde.';
    
    // Log detalhado do erro apenas para erros críticos
    if (statusCode >= 500 || statusCode === 401 || statusCode === 403) {
      logSecurityEvent('api_error', {
        status: statusCode,
        url: error.config?.url,
        method: error.config?.method,
        message: error.response?.data?.message || error.message,
        retryCount
      });
    }
    
    // Adicionar mensagem de erro consistente
    error.userMessage = errorMessages[statusCode] || defaultMessage;
    
    return Promise.reject(error);
  }
);

// Função para configurar token manualmente
export const setAuthToken = (token) => {
  if (token) {
    // Verificar se o token não está expirado antes de configurar
    if (!securityUtils.isTokenExpired(token)) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      

    } else {
      logSecurityEvent('set_expired_token', { token: token.substring(0, 10) + '...' });
      clearAuthToken();
    }
  } else {
    clearAuthToken();
  }
};

// Função para limpar configurações de autenticação
export const clearAuthToken = () => {
  delete api.defaults.headers.common.Authorization;
};

// Função para verificar se o token está próximo da expiração
export const isTokenNearExpiry = () => {
  const token = secureStorage.getItem('token');
  if (!token) return true;
  
  const timeRemaining = securityUtils.getTokenTimeRemaining(token);
  const warningThreshold = 10 * 60 * 1000; // 10 minutos
  
  return timeRemaining < warningThreshold;
};

// Função para obter tempo restante do token
export const getTokenTimeRemaining = () => {
  const token = secureStorage.getItem('token');
  if (!token) return 0;
  
  return securityUtils.getTokenTimeRemaining(token);
};

// Função para verificar se há uma requisição de refresh em andamento
export const isRefreshingToken = () => {
  return isRefreshing;
};

// Função para cancelar todas as requisições pendentes
export const cancelPendingRequests = () => {
  // Implementar cancelamento de requisições se necessário
  failedQueue.forEach(prom => {
    prom.reject(new Error('Requisição cancelada'));
  });
  failedQueue = [];
};

export default api;

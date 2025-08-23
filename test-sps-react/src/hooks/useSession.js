import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { securityUtils } from '../config/security';
import { isTokenNearExpiry, getTokenTimeRemaining, isRefreshingToken } from '../services/httpInterceptor';
import { logSecurityEvent } from '../middleware/security';

/**
 * Hook para gerenciar a sessão do usuário
 * Inclui monitoramento de atividade, avisos de expiração e limpeza automática
 */
const useSession = () => {
  const { user, logout, refreshToken, isRefreshing: authRefreshing, refreshError } = useAuth();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isInactive, setIsInactive] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const warningTimeoutRef = useRef(null);
  const expiryTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const sessionCheckIntervalRef = useRef(null);

  // Configurações da sessão
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  const WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutos antes da expiração
  const ACTIVITY_CHECK_INTERVAL = 60000; // 1 minuto
  const SESSION_CHECK_INTERVAL = 30000; // 30 segundos

  // Atualizar atividade do usuário
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsInactive(false);
    setSessionError(null);
    
    // Limpar timeout de inatividade
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    // Configurar novo timeout de inatividade
    activityTimeoutRef.current = setTimeout(() => {
      setIsInactive(true);
      logSecurityEvent('user_inactive', { 
        userId: user?.id,
        userEmail: user?.email 
      });
    }, SESSION_TIMEOUT);
  }, [user, SESSION_TIMEOUT]);

  // Verificar expiração do token
  const checkTokenExpiry = useCallback(() => {
    if (!user) return;

    try {
      const remaining = getTokenTimeRemaining();
      setTimeRemaining(remaining);

      // Limpar timeouts existentes
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
      }

      if (remaining <= 0) {
        // Token já expirou
        logSecurityEvent('session_expired', { 
          userId: user.id,
          userEmail: user.email 
        });
        setSessionError('Sessão expirada');
        logout();
        return;
      }

      if (remaining <= WARNING_THRESHOLD) {
        // Mostrar aviso de expiração
        setSessionWarning(true);
        logSecurityEvent('session_warning', { 
          userId: user.id,
          userEmail: user.email,
          timeRemaining: remaining 
        });
      }

      // Configurar timeout para aviso
      if (remaining > WARNING_THRESHOLD) {
        const warningTime = remaining - WARNING_THRESHOLD;
        warningTimeoutRef.current = setTimeout(() => {
          setSessionWarning(true);
          logSecurityEvent('session_warning', { 
            userId: user.id,
            userEmail: user.email,
            timeRemaining: WARNING_THRESHOLD 
          });
        }, warningTime);
      }

      // Configurar timeout para expiração
      expiryTimeoutRef.current = setTimeout(() => {
        logSecurityEvent('session_expired', { 
          userId: user.id,
          userEmail: user.email 
        });
        setSessionError('Sessão expirada');
        logout();
      }, remaining);
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      setSessionError('Erro ao verificar sessão');
      logSecurityEvent('token_check_error', { 
        userId: user?.id,
        error: error.message 
      });
    }
  }, [user, logout, WARNING_THRESHOLD]);

  // Renovar sessão
  const renewSession = useCallback(async () => {
    if (!user || isRefreshingToken()) return false;

    try {
      setSessionError(null);
      logSecurityEvent('session_renewal_attempt', { 
        userId: user.id,
        userEmail: user.email 
      });

      await refreshToken();
      setSessionWarning(false);
      updateActivity();
      checkTokenExpiry();

      logSecurityEvent('session_renewal_success', { 
        userId: user.id,
        userEmail: user.email 
      });

      return true;
    } catch (error) {
      setSessionError(error.message);
      logSecurityEvent('session_renewal_failed', { 
        userId: user.id,
        userEmail: user.email,
        error: error.message 
      });
      
      logout();
      return false;
    }
  }, [user, refreshToken, updateActivity, checkTokenExpiry, logout]);

  // Estender sessão
  const extendSession = useCallback(() => {
    updateActivity();
    setSessionWarning(false);
    setSessionError(null);
    
    logSecurityEvent('session_extended', { 
      userId: user?.id,
      userEmail: user?.email 
    });
  }, [user, updateActivity]);

  // Sincronizar com mudanças em outras abas
  const handleStorageChange = useCallback((event) => {
    if (event.key === 'token' || event.key === 'user') {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const currentToken = localStorage.getItem('token');
      
      if (!currentToken || !currentUser) {
        // Token foi removido em outra aba
        setSessionWarning(false);
        setTimeRemaining(null);
        setIsInactive(false);
        setSessionError('Sessão encerrada em outra aba');
      } else if (currentUser && currentUser.id !== user?.id) {
        // Usuário mudou em outra aba
        setSessionError(null);
        checkTokenExpiry();
      }
    }
  }, [user, checkTokenExpiry]);

  // Listener para logout em outras abas
  const handleLogoutEvent = useCallback((event) => {
    if (event.detail && event.detail.userId === user?.id) {
      logSecurityEvent('logout_from_other_tab', { 
        userId: user.id,
        userEmail: user.email,
        timestamp: event.detail.timestamp 
      });
      
      setSessionWarning(false);
      setTimeRemaining(null);
      setIsInactive(false);
      setSessionError('Sessão encerrada em outra aba');
    }
  }, [user]);

  // Configurar listeners de atividade
  useEffect(() => {
    if (!user) return;

    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'focus', 'visibilitychange'
    ];

    const activityHandler = () => updateActivity();

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // Inicializar atividade
    updateActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
    };
  }, [user, updateActivity]);

  // Configurar verificação periódica
  useEffect(() => {
    if (!user) return;

    // Verificação mais frequente para sessões próximas da expiração
    sessionCheckIntervalRef.current = setInterval(() => {
      checkTokenExpiry();
      
      // Verificar se o token está próximo da expiração
      if (isTokenNearExpiry()) {
        setSessionWarning(true);
      }
    }, SESSION_CHECK_INTERVAL);

    // Verificação inicial
    checkTokenExpiry();

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [user, checkTokenExpiry, SESSION_CHECK_INTERVAL]);

  // Configurar listeners de sincronização
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [handleStorageChange, handleLogoutEvent]);

  // Limpeza de timeouts ao desmontar
  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, []);

  // Formatar tempo restante para exibição
  const formatTimeRemaining = useCallback(() => {
    if (!timeRemaining || timeRemaining <= 0) return 'Expirado';

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [timeRemaining]);

  // Verificar se a sessão está ativa
  const isSessionActive = useCallback(() => {
    return user && !isInactive && timeRemaining > 0 && !sessionError;
  }, [user, isInactive, timeRemaining, sessionError]);

  // Verificar se há erro de refresh
  useEffect(() => {
    if (refreshError) {
      setSessionError(refreshError);
    }
  }, [refreshError]);

  return {
    // Estado da sessão
    sessionWarning,
    timeRemaining,
    isInactive,
    isSessionActive: isSessionActive(),
    sessionError,
    
    // Funções de controle
    updateActivity,
    renewSession,
    extendSession,
    formatTimeRemaining,
    
    // Informações da sessão
    sessionTimeout: SESSION_TIMEOUT,
    warningThreshold: WARNING_THRESHOLD,
    lastActivity: lastActivityRef.current,
    
    // Status
    isNearExpiry: isTokenNearExpiry(),
    isExpired: timeRemaining <= 0,
    needsRenewal: sessionWarning && timeRemaining > 0,
    isRefreshing: authRefreshing || isRefreshingToken()
  };
};

export default useSession;

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isTokenNearExpiry, getTokenTimeRemaining, isRefreshingToken } from '../services/httpInterceptor';
import { logSecurityEvent, secureStorage } from '../middleware/security';

const useSession = () => {
  // Sempre chamar os hooks no topo do componente
  const authContext = useAuth();
  
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isInactive, setIsInactive] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const warningTimeoutRef = useRef(null);
  const expiryTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const sessionCheckIntervalRef = useRef(null);

  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const WARNING_THRESHOLD = 5 * 60 * 1000;
  const SESSION_CHECK_INTERVAL = 30000;

  // Extrair dados do contexto de autenticação
  const user = authContext && authContext.user ? authContext.user : null;
  const logout = useMemo(() => 
    authContext && authContext.logout ? authContext.logout : () => {}, 
    [authContext]
  );
  const refreshToken = useMemo(() => 
    authContext && authContext.refreshToken ? authContext.refreshToken : () => Promise.resolve(), 
    [authContext]
  );
  const authRefreshing = authContext && authContext.isRefreshing ? authContext.isRefreshing : false;
  const refreshError = authContext && authContext.refreshError ? authContext.refreshError : null;

  const updateActivity = useCallback(() => {
    if (!user) return; // Não fazer nada se não há usuário
    
    lastActivityRef.current = Date.now();
    setIsInactive(false);
    setSessionError(null);
    
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsInactive(true);
      // Verificar se logSecurityEvent está disponível antes de chamá-la
      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('user_inactive', { 
          userId: user?.id,
          userEmail: user?.email 
        });
      }
    }, SESSION_TIMEOUT);
  }, [user, SESSION_TIMEOUT]);

  const checkTokenExpiry = useCallback(() => {
    if (!user) {
      // Limpar estados quando não há usuário
      setSessionWarning(false);
      setTimeRemaining(null);
      setSessionError(null);
      return;
    }

    try {
      // Verificar se a função getTokenTimeRemaining está disponível antes de chamá-la
      if (typeof getTokenTimeRemaining !== 'function') {
        console.warn('getTokenTimeRemaining não está disponível');
        return;
      }

      const remaining = getTokenTimeRemaining();
      setTimeRemaining(remaining);

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
      }

      if (remaining <= 0) {
        // Verificar se logSecurityEvent está disponível antes de chamá-la
        if (typeof logSecurityEvent === 'function') {
          logSecurityEvent('session_expired', { 
            userId: user?.id || 'unknown',
            userEmail: user?.email || 'unknown'
          });
        }
        setSessionError('Sessão expirada');
        logout();
        return;
      }

      if (remaining <= WARNING_THRESHOLD) {
        setSessionWarning(true);
        // Verificar se logSecurityEvent está disponível antes de chamá-la
        if (typeof logSecurityEvent === 'function') {
          logSecurityEvent('session_warning', { 
            userId: user?.id || 'unknown',
            userEmail: user?.email || 'unknown',
            timeRemaining: remaining 
          });
        }
      }

      if (remaining > WARNING_THRESHOLD) {
        const warningTime = remaining - WARNING_THRESHOLD;
        warningTimeoutRef.current = setTimeout(() => {
          setSessionWarning(true);
          // Verificar se logSecurityEvent está disponível antes de chamá-la
          if (typeof logSecurityEvent === 'function') {
            logSecurityEvent('session_warning', { 
              userId: user?.id || 'unknown',
              userEmail: user?.email || 'unknown',
              timeRemaining: WARNING_THRESHOLD 
            });
          }
        }, warningTime);
      }

      expiryTimeoutRef.current = setTimeout(() => {
        // Verificar se logSecurityEvent está disponível antes de chamá-la
        if (typeof logSecurityEvent === 'function') {
          logSecurityEvent('session_expired', { 
            userId: user?.id || 'unknown',
            userEmail: user?.email || 'unknown'
          });
        }
        setSessionError('Sessão expirada');
        logout();
      }, remaining);
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      setSessionError('Erro ao verificar sessão');
      // Verificar se logSecurityEvent está disponível antes de chamá-la
      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('token_check_error', { 
          userId: user?.id,
          error: error.message 
        });
      }
    }
  }, [user, logout, WARNING_THRESHOLD]);

  const renewSession = useCallback(async () => {
    if (!user) return false;

    // Verificar se a função isRefreshingToken está disponível antes de chamá-la
    if (typeof isRefreshingToken === 'function') {
      if (isRefreshingToken()) return false;
    }

    try {
      setSessionError(null);
      // Verificar se logSecurityEvent está disponível antes de chamá-la
      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('session_renewal_attempt', { 
          userId: user?.id || 'unknown',
          userEmail: user?.email || 'unknown'
        });
      }

      await refreshToken();
      setSessionWarning(false);
      updateActivity();
      checkTokenExpiry();

      // Verificar se logSecurityEvent está disponível antes de chamá-la
      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('session_renewal_success', { 
          userId: user?.id || 'unknown',
          userEmail: user?.email || 'unknown'
        });
      }

      return true;
    } catch (error) {
      setSessionError(error.message);
      // Verificar se logSecurityEvent está disponível antes de chamá-la
      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('session_renewal_failed', { 
          userId: user?.id || 'unknown',
          userEmail: user?.email || 'unknown',
          error: error.message 
        });
      }
      
      logout();
      return false;
    }
  }, [user, refreshToken, updateActivity, checkTokenExpiry, logout]);

  const extendSession = useCallback(() => {
    updateActivity();
    setSessionWarning(false);
    setSessionError(null);
    
    // Verificar se logSecurityEvent está disponível antes de chamá-la
    if (typeof logSecurityEvent === 'function') {
      logSecurityEvent('session_extended', { 
        userId: user?.id,
        userEmail: user?.email 
      });
    }
  }, [user, updateActivity]);

  const handleStorageChange = useCallback((event) => {
    if (event.key === 'token' || event.key === 'user') {
      // Verificar se secureStorage está disponível
      let currentUser, currentToken;
      
      if (secureStorage && typeof secureStorage.getItem === 'function') {
        currentUser = secureStorage.getItem('user');
        currentToken = secureStorage.getItem('token');
      } else {
        // Fallback para localStorage
        currentUser = localStorage.getItem('user');
        currentToken = localStorage.getItem('token');
      }
      
      if (!currentToken || !currentUser) {
        setSessionWarning(false);
        setTimeRemaining(null);
        setIsInactive(false);
        setSessionError('Sessão encerrada em outra aba');
      } else if (currentUser && currentUser.id !== user?.id) {
        setSessionError(null);
        checkTokenExpiry();
      }
    }
  }, [user, checkTokenExpiry]);

  const handleLogoutEvent = useCallback((event) => {
    // Verificar se o evento tem detalhes e se o usuário ainda existe
    if (event.detail && user && event.detail.userId === user.id) {
      // Verificar se logSecurityEvent está disponível antes de chamá-la
      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('logout_from_other_tab', { 
          userId: user.id,
          userEmail: user.email,
          timestamp: event.detail.timestamp 
        });
      }
      
      setSessionWarning(false);
      setTimeRemaining(null);
      setIsInactive(false);
      setSessionError('Sessão encerrada em outra aba');
    } else if (event.detail && !user) {
      // Caso o usuário já tenha sido limpo, apenas limpar os estados
      setSessionWarning(false);
      setTimeRemaining(null);
      setIsInactive(false);
      setSessionError('Sessão encerrada');
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      // Limpar timeouts quando não há usuário
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
        activityTimeoutRef.current = null;
      }
      return;
    }

    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'focus', 'visibilitychange'
    ];

    const activityHandler = () => updateActivity();

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    updateActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
    };
  }, [user, updateActivity]);

  useEffect(() => {
    if (!user) {
      // Limpar intervalos quando não há usuário
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
      return;
    }

    sessionCheckIntervalRef.current = setInterval(() => {
      checkTokenExpiry();
      
      // Verificar se a função isTokenNearExpiry está disponível antes de chamá-la
      if (typeof isTokenNearExpiry === 'function') {
        try {
          if (isTokenNearExpiry()) {
            setSessionWarning(true);
          }
        } catch (error) {
          console.error('Erro ao verificar se token está próximo da expiração:', error);
        }
      }
    }, SESSION_CHECK_INTERVAL);

    checkTokenExpiry();

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [user, checkTokenExpiry, SESSION_CHECK_INTERVAL]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [handleStorageChange, handleLogoutEvent]);

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

  const formatTimeRemaining = useCallback(() => {
    if (!timeRemaining || timeRemaining <= 0) return 'Expirado';

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [timeRemaining]);

  const isSessionActive = useCallback(() => {
    return user && !isInactive && timeRemaining > 0 && !sessionError;
  }, [user, isInactive, timeRemaining, sessionError]);

  useEffect(() => {
    if (refreshError) {
      setSessionError(refreshError);
    }
  }, [refreshError]);

  // Retornar valores padrão se não há contexto ou usuário
  if (!authContext) {
    return {
      sessionWarning: false,
      timeRemaining: null,
      isInactive: false,
      isSessionActive: false,
      renewSession: () => Promise.resolve(false),
      extendSession: () => {},
      formatTimeRemaining: () => '',
      isNearExpiry: false,
      isExpired: false,
      needsRenewal: false,
      sessionError: null,
      isRefreshing: false
    };
  }
  
  if (!user) {
    return {
      sessionWarning: false,
      timeRemaining: null,
      isInactive: false,
      isSessionActive: false,
      renewSession: () => Promise.resolve(false),
      extendSession: () => {},
      formatTimeRemaining: () => '',
      isNearExpiry: false,
      isExpired: false,
      needsRenewal: false,
      sessionError: null,
      isRefreshing: false
    };
  }

  return {
    sessionWarning,
    timeRemaining,
    isInactive,
    isSessionActive: isSessionActive(),
    sessionError,
    
    updateActivity,
    renewSession,
    extendSession,
    formatTimeRemaining,
    
    sessionTimeout: SESSION_TIMEOUT,
    warningThreshold: WARNING_THRESHOLD,
    lastActivity: lastActivityRef.current,
    
    isNearExpiry: typeof isTokenNearExpiry === 'function' ? isTokenNearExpiry() : false,
    isExpired: timeRemaining <= 0,
    needsRenewal: sessionWarning && timeRemaining > 0,
    isRefreshing: authRefreshing || (typeof isRefreshingToken === 'function' ? isRefreshingToken() : false)
  };
};

export default useSession;

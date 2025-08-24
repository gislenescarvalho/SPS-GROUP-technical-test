import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isTokenNearExpiry, getTokenTimeRemaining, isRefreshingToken } from '../services/httpInterceptor';
import { logSecurityEvent } from '../middleware/security';

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

  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const WARNING_THRESHOLD = 5 * 60 * 1000;
  const SESSION_CHECK_INTERVAL = 30000;

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsInactive(false);
    setSessionError(null);
    
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      setIsInactive(true);
      logSecurityEvent('user_inactive', { 
        userId: user?.id,
        userEmail: user?.email 
      });
    }, SESSION_TIMEOUT);
  }, [user, SESSION_TIMEOUT]);

  const checkTokenExpiry = useCallback(() => {
    if (!user) return;

    try {
      const remaining = getTokenTimeRemaining();
      setTimeRemaining(remaining);

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
      }

      if (remaining <= 0) {
        logSecurityEvent('session_expired', { 
          userId: user.id,
          userEmail: user.email 
        });
        setSessionError('Sessão expirada');
        logout();
        return;
      }

      if (remaining <= WARNING_THRESHOLD) {
        setSessionWarning(true);
        logSecurityEvent('session_warning', { 
          userId: user.id,
          userEmail: user.email,
          timeRemaining: remaining 
        });
      }

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

  const extendSession = useCallback(() => {
    updateActivity();
    setSessionWarning(false);
    setSessionError(null);
    
    logSecurityEvent('session_extended', { 
      userId: user?.id,
      userEmail: user?.email 
    });
  }, [user, updateActivity]);

  const handleStorageChange = useCallback((event) => {
    if (event.key === 'token' || event.key === 'user') {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const currentToken = localStorage.getItem('token');
      
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

    updateActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
    };
  }, [user, updateActivity]);

  useEffect(() => {
    if (!user) return;

    sessionCheckIntervalRef.current = setInterval(() => {
      checkTokenExpiry();
      
      if (isTokenNearExpiry()) {
        setSessionWarning(true);
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
    
    isNearExpiry: isTokenNearExpiry(),
    isExpired: timeRemaining <= 0,
    needsRenewal: sessionWarning && timeRemaining > 0,
    isRefreshing: authRefreshing || isRefreshingToken()
  };
};

export default useSession;

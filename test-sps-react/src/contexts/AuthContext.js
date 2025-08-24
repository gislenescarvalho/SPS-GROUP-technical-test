import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AuthService from '../services/AuthService';
import { logSecurityEvent } from '../middleware/security';
import { isTokenNearExpiry, getTokenTimeRemaining } from '../services/httpInterceptor';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const refreshTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  const refreshThreshold = 5 * 60 * 1000;
  const sessionTimeout = 30 * 60 * 1000;

  const checkTokenExpiry = useCallback(() => {
    if (!user) return;

    try {
      const remaining = getTokenTimeRemaining();
      
      if (remaining <= 0) {
        logSecurityEvent('token_expired', { 
          userId: user.id,
          userEmail: user.email 
        });
        handleLogout();
        return;
      }

      if (remaining <= refreshThreshold && !isRefreshing) {
        refreshTokenIfNeeded();
      }
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
      logSecurityEvent('token_check_error', { 
        userId: user?.id,
        error: error.message 
      });
    }
  }, [user, isRefreshing, refreshThreshold]);

  const refreshTokenIfNeeded = useCallback(async () => {
    if (!user || isRefreshing) return;

    try {
      setIsRefreshing(true);
      setRefreshError(null);
      
      logSecurityEvent('token_refresh_attempt', { 
        userId: user.id,
        userEmail: user.email 
      });

      const newToken = await AuthService.refreshToken();
      
      if (newToken) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        
        logSecurityEvent('token_refresh_success', { 
          userId: user.id,
          userEmail: user.email 
        });
      }
    } catch (error) {
      setRefreshError(error.message);
      logSecurityEvent('token_refresh_failed', { 
        userId: user.id,
        userEmail: user.email,
        error: error.message 
      });
      
      handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  }, [user, isRefreshing]);

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      logSecurityEvent('user_inactive', { 
        userId: user?.id,
        userEmail: user?.email 
      });
    }, sessionTimeout);
  }, [user, sessionTimeout]);

  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;
    
    if (timeSinceLastActivity >= sessionTimeout) {
      logSecurityEvent('session_timeout', { 
        userId: user?.id,
        userEmail: user?.email,
        inactiveTime: timeSinceLastActivity 
      });
      handleLogout();
    }
  }, [lastActivity, sessionTimeout, user]);

  const handleLogout = useCallback(() => {
    try {
      AuthService.logout();
      setUser(null);
      setRefreshError(null);
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { 
          userId: user?.id,
          timestamp: Date.now() 
        }
      }));
      
      logSecurityEvent('user_logout', { 
        userId: user?.id,
        userEmail: user?.email 
      });
    } catch (error) {
      console.error('Erro durante logout:', error);
    }
  }, [user]);

  const handleStorageChange = useCallback((event) => {
    if (event.key === 'token' || event.key === 'user') {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const currentToken = localStorage.getItem('token');
      
      if (!currentToken || !currentUser) {
        setUser(null);
      } else if (currentUser && currentUser.id !== user?.id) {
        setUser(currentUser);
      }
    }
  }, [user]);

  const handleLogoutEvent = useCallback((event) => {
    if (event.detail && event.detail.userId === user?.id) {
      setUser(null);
      setRefreshError(null);
    }
  }, [user]);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      setRefreshError(null);
      
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        updateActivity();
        
        logSecurityEvent('user_login_success', { 
          userId: response.user.id,
          userEmail: response.user.email 
        });
        
        return { success: true, user: response.user };
      } else {
        logSecurityEvent('user_login_failed', { 
          email: credentials.email,
          reason: response.message 
        });
        
        return { success: false, message: response.message };
      }
    } catch (error) {
      logSecurityEvent('user_login_error', { 
        email: credentials.email,
        error: error.message 
      });
      
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [updateActivity]);

  const logout = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  const refreshToken = useCallback(async () => {
    return await refreshTokenIfNeeded();
  }, [refreshTokenIfNeeded]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const response = await AuthService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        logSecurityEvent('password_change_success', { 
          userId: user?.id,
          userEmail: user?.email 
        });
      } else {
        logSecurityEvent('password_change_failed', { 
          userId: user?.id,
          userEmail: user?.email,
          reason: response.message 
        });
      }
      
      return response;
    } catch (error) {
      logSecurityEvent('password_change_error', { 
        userId: user?.id,
        userEmail: user?.email,
        error: error.message 
      });
      
      throw error;
    }
  }, [user]);

  const initializeAuth = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (token && userData) {
        setUser(userData);
        updateActivity();
        checkTokenExpiry();
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      logSecurityEvent('auth_init_error', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [updateActivity, checkTokenExpiry]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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

    const inactivityInterval = setInterval(checkInactivity, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
      clearInterval(inactivityInterval);
    };
  }, [user, updateActivity, checkInactivity]);

  useEffect(() => {
    if (!user) return;

    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiry();
    }, 30000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [user, checkTokenExpiry]);

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
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    user,
    isLoading,
    isRefreshing,
    refreshError,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
    changePassword,
    updateActivity,
    lastActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


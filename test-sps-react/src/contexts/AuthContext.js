import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AuthService from '../services/AuthService';
import { logSecurityEvent, secureStorage } from '../middleware/security';
import { getTokenTimeRemaining } from '../services/httpInterceptor';
import { securityUtils } from '../config/security';

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

  // Definir handleLogout primeiro para evitar dependências circulares
  const handleLogout = useCallback(() => {
    try {
      AuthService.logout();
      setUser(null);
      setRefreshError(null);
      
      // Limpar também localStorage para garantir
      if (secureStorage && secureStorage.removeItem) {
        secureStorage.removeItem('token');
        secureStorage.removeItem('refreshToken');
        secureStorage.removeItem('user');
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
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
      
      // Log de logout apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Usuário deslogado:', { 
          userId: user?.id,
          userEmail: user?.email 
        });
      }
    } catch (error) {
      console.error('Erro durante logout:', error);
    }
  }, [user]);

  const refreshTokenIfNeeded = useCallback(async () => {
    if (!user || isRefreshing) return;

    try {
      setIsRefreshing(true);
      setRefreshError(null);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Tentativa de renovação de token:', { 
          userId: user?.id || 'unknown',
          userEmail: user?.email || 'unknown'
        });
      }

      const newToken = await AuthService.refreshToken();
      
      if (newToken) {
        const userData = (secureStorage && secureStorage.getItem) ? secureStorage.getItem('user') : null;
        const fallbackUserData = localStorage.getItem('user');
        const finalUserData = userData || (fallbackUserData ? JSON.parse(fallbackUserData) : {});
        setUser(finalUserData);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Token renovado com sucesso:', { 
            userId: user?.id || 'unknown',
            userEmail: user?.email || 'unknown'
          });
        }
      }
    } catch (error) {
      setRefreshError(error.message);
      logSecurityEvent('token_refresh_failed', { 
        userId: user?.id || 'unknown',
        userEmail: user?.email || 'unknown',
        error: error.message 
      });
      
      handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  }, [user, isRefreshing, handleLogout]);



  const handleStorageChange = useCallback((event) => {
    if (event.key === 'token' || event.key === 'user') {
      const currentUser = (secureStorage && secureStorage.getItem) ? secureStorage.getItem('user') : null;
      const currentToken = (secureStorage && secureStorage.getItem) ? secureStorage.getItem('token') : null;
      const fallbackUser = localStorage.getItem('user');
      const fallbackToken = localStorage.getItem('token');
      
      const finalUser = currentUser || (fallbackUser ? JSON.parse(fallbackUser) : null);
      const finalToken = currentToken || fallbackToken;
      
      if (!finalToken || !finalUser) {
        setUser(null);
      } else if (finalUser && finalUser.id !== user?.id) {
        setUser(finalUser);
      }
    }
  }, [user]);

  const handleLogoutEvent = useCallback((event) => {
    if (event.detail && event.detail.userId === user?.id) {
      setUser(null);
      setRefreshError(null);
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setRefreshError(null);
      
      const response = await AuthService.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        setLastActivity(Date.now());
        
        // Log de login bem-sucedido apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Usuário logado com sucesso:', { 
            userId: response.user.id, 
            userEmail: response.user.email 
          });
        }
        
        return { success: true, user: response.user };
      } else {
        // Log de login falhado apenas se for um erro real
        if (response.message && response.message !== 'Erro ao fazer login') {
          logSecurityEvent('user_login_failed', { 
            email: email,
            reason: response.message 
          });
        }
        
        return { success: false, message: response.message };
      }
    } catch (error) {
      // Log de erro de login apenas se for um erro crítico
      if (error.message && !error.message.includes('Erro ao fazer login')) {
        logSecurityEvent('user_login_error', { 
          email: email,
          error: error.message 
        });
      }
      
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      const token = (secureStorage && secureStorage.getItem) ? secureStorage.getItem('token') : null;
      const userData = (secureStorage && secureStorage.getItem) ? secureStorage.getItem('user') : null;
      const fallbackToken = localStorage.getItem('token');
      const fallbackUserData = localStorage.getItem('user');
      
      const finalToken = token || fallbackToken;
      const finalUserData = userData || (fallbackUserData ? JSON.parse(fallbackUserData) : null);
      
      if (finalToken && finalUserData) {
        // Verificar se o token não está expirado antes de definir o usuário
        if (!securityUtils.isTokenExpired(finalToken)) {
          setUser(finalUserData);
          setLastActivity(Date.now());
          

        } else {
          // Limpar dados expirados
          if (secureStorage && secureStorage.removeItem) {
            secureStorage.removeItem('token');
            secureStorage.removeItem('refreshToken');
            secureStorage.removeItem('user');
          }

          logSecurityEvent('auth_init_token_expired', { 
            userEmail: finalUserData?.email 
          });
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      logSecurityEvent('auth_init_error', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!user) return;

    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'focus', 'visibilitychange'
    ];

    const activityHandler = () => {
      setLastActivity(Date.now());
      
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      activityTimeoutRef.current = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Usuário inativo:', { 
            userId: user?.id,
            userEmail: user?.email 
          });
        }
      }, sessionTimeout);
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    const inactivityInterval = setInterval(() => {
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
    }, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
      clearInterval(inactivityInterval);
    };
  }, [user, lastActivity, sessionTimeout, handleLogout]);

  useEffect(() => {
    if (!user) return;

    const tokenCheckInterval = setInterval(() => {
      try {
        const remaining = getTokenTimeRemaining();
        
        if (remaining <= 0) {
          logSecurityEvent('token_expired', { 
            userId: user?.id || 'unknown',
            userEmail: user?.email || 'unknown'
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
    }, 30000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [user, isRefreshing, refreshThreshold, handleLogout, refreshTokenIfNeeded]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [handleStorageChange, handleLogoutEvent]);

  useEffect(() => {
    const refreshTimeout = refreshTimeoutRef.current;
    const activityTimeout = activityTimeoutRef.current;
    
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      if (activityTimeout) {
        clearTimeout(activityTimeout);
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
    lastActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


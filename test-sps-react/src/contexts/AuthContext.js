import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AuthService from "../services/AuthService";
import { securityUtils } from "../config/security";
import { logSecurityEvent } from "../middleware/security";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);

  // Verificar se o token está expirado
  const checkTokenExpiry = useCallback(() => {
    const token = AuthService.getToken();
    if (!token) return false;

    const isExpired = securityUtils.isTokenExpired(token);
    const timeRemaining = securityUtils.getTokenTimeRemaining(token);
    
    if (isExpired) {
      logSecurityEvent('token_expired', { 
        userId: user?.id,
        userEmail: user?.email 
      });
      return true;
    }

    // Atualizar tempo de expiração
    setTokenExpiry(timeRemaining);
    return false;
  }, [user]);

  // Renovar token automaticamente com retry
  const refreshTokenIfNeeded = useCallback(async (retryCount = 0) => {
    const token = AuthService.getToken();
    if (!token || isRefreshing) return;

    const timeRemaining = securityUtils.getTokenTimeRemaining(token);
    const refreshThreshold = 5 * 60 * 1000; // 5 minutos antes da expiração

    if (timeRemaining > 0 && timeRemaining < refreshThreshold) {
      try {
        setIsRefreshing(true);
        setRefreshError(null);
        
        logSecurityEvent('token_refresh_attempt', { 
          userId: user?.id,
          timeRemaining,
          retryCount 
        });

        const { token: newToken, refreshToken: newRefreshToken } = await AuthService.refreshToken();
        
        // Validar novo token
        if (securityUtils.isTokenExpired(newToken)) {
          throw new Error('Novo token já está expirado');
        }
        
        // Atualizar estado do usuário se necessário
        const currentUser = AuthService.getUser();
        if (currentUser) {
          setUser(currentUser);
        }

        logSecurityEvent('token_refresh_success', { 
          userId: user?.id,
          userEmail: user?.email 
        });

        return { token: newToken, refreshToken: newRefreshToken };
      } catch (error) {
        setRefreshError(error.message);
        
        logSecurityEvent('token_refresh_failed', { 
          userId: user?.id,
          error: error.message,
          retryCount 
        });
        
        // Retry com backoff exponencial (máximo 3 tentativas)
        if (retryCount < 3 && error.message.includes('network')) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          setTimeout(() => {
            refreshTokenIfNeeded(retryCount + 1);
          }, delay);
          return;
        }
        
        // Se a renovação falhar definitivamente, fazer logout
        await handleLogout();
        return null;
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [user, isRefreshing]);

  // Monitorar atividade do usuário
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Verificar inatividade
  const checkInactivity = useCallback(() => {
    const sessionTimeout = 30 * 60 * 1000; // 30 minutos
    const timeSinceLastActivity = Date.now() - lastActivity;
    
    if (timeSinceLastActivity > sessionTimeout && user) {
      logSecurityEvent('session_timeout', { 
        userId: user.id,
        userEmail: user.email,
        timeSinceLastActivity 
      });
      
      handleLogout();
    }
  }, [lastActivity, user]);

  // Logout com limpeza completa e sincronização entre abas
  const handleLogout = useCallback(async () => {
    try {
      // Notificar outras abas sobre o logout
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { userId: user?.id, timestamp: Date.now() }
      }));
      
      await AuthService.logout();
    } catch (error) {
      console.error('Erro durante logout:', error);
    } finally {
      // Limpeza completa do estado
      setUser(null);
      setTokenExpiry(null);
      setLastActivity(Date.now());
      setRefreshError(null);
      setIsRefreshing(false);
      
      // Limpar dados de sessão de forma mais abrangente
      const keysToRemove = [
        'token', 'refreshToken', 'user', 'auth_data', 'session_data',
        'user_preferences', 'temp_data', 'cache_data'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Limpar dados de cache se existir
      if (window.caches) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        } catch (error) {
          console.error('Erro ao limpar cache:', error);
        }
      }

      // Limpar dados de sessão do navegador
      sessionStorage.clear();
      
      // Limpar cookies relacionados à autenticação
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      logSecurityEvent('logout_complete', { 
        userId: user?.id,
        userEmail: user?.email 
      });
    }
  }, [user]);

  // Sincronizar estado entre abas com melhor tratamento
  const handleStorageChange = useCallback((event) => {
    if (event.key === 'token' || event.key === 'user') {
      const currentUser = AuthService.getUser();
      const currentToken = AuthService.getToken();
      
      if (!currentToken || !currentUser) {
        // Token foi removido em outra aba
        setUser(null);
        setTokenExpiry(null);
        setRefreshError(null);
      } else if (currentUser && currentUser.id !== user?.id) {
        // Usuário mudou em outra aba
        setUser(currentUser);
        setRefreshError(null);
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
      
      // Limpar estado local sem fazer chamada para o servidor
      setUser(null);
      setTokenExpiry(null);
      setLastActivity(Date.now());
      setRefreshError(null);
      setIsRefreshing(false);
    }
  }, [user]);

  // Inicialização da autenticação com melhor tratamento de erros
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        AuthService.setupAuthInterceptor();
        const currentUser = AuthService.getUser();
        
        if (currentUser) {
          // Verificar se o token não está expirado
          if (!checkTokenExpiry()) {
            setUser(currentUser);
            
            // Tentar renovar token se necessário
            await refreshTokenIfNeeded();
          } else {
            // Token expirado, fazer logout
            await handleLogout();
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        logSecurityEvent('auth_initialization_error', { 
          error: error.message 
        });
        await handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Configurar listeners de atividade
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => updateActivity();
    
    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
    };
  }, [updateActivity]);

  // Configurar verificação periódica
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (user) {
        checkTokenExpiry();
        checkInactivity();
        refreshTokenIfNeeded();
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(checkInterval);
  }, [user, checkTokenExpiry, checkInactivity, refreshTokenIfNeeded]);

  // Configurar listener de mudanças no localStorage
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [handleStorageChange, handleLogoutEvent]);

  const login = async (email, password) => {
    try {
      setRefreshError(null);
      const { user: userData } = await AuthService.login(email, password);
      setUser(userData);
      setLastActivity(Date.now());
      checkTokenExpiry();
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = handleLogout;

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    tokenExpiry,
    lastActivity,
    updateActivity,
    refreshToken: refreshTokenIfNeeded,
    isRefreshing,
    refreshError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


import AuthRepository from '../repositories/AuthRepository';
import { setAuthToken, clearAuthToken } from './httpInterceptor';
import { secureStorage, validateEmail, validatePassword, logSecurityEvent } from '../middleware/security';

/**
 * Serviço para operações de autenticação
 * Implementa a lógica de negócio usando o repositório
 */
class AuthService {
  constructor() {
    this.repository = AuthRepository;
  }

  /**
   * Realizar login
   */
  async login(email, password) {
    try {
      // Validação de entrada
      if (!validateEmail(email)) {
        throw new Error('Email inválido');
      }
      
      if (!password || password.length < 4) {
        throw new Error('Senha deve ter pelo menos 4 caracteres');
      }
      
      // Validar força da senha (mais permissivo para desenvolvimento)
      if (process.env.NODE_ENV === 'production' && !validatePassword(password)) {
        throw new Error('Senha não atende aos critérios de segurança');
      }
      
      // Chamar repositório para login com senha em plain text (desenvolvimento)
      const result = await this.repository.login({
        email: email.toLowerCase().trim(),
        password: password
      });
      
      // Verificar se a resposta é válida
      if (!result || !result.data) {
        throw new Error('Resposta inválida do servidor');
      }
      
      // Extrair dados da resposta do servidor
      const { user, accessToken: token, refreshToken } = result.data;
      
      // Verificar se os dados necessários estão presentes
      if (!user || !token) {
        throw new Error('Dados de autenticação incompletos');
      }
      
      // Salvar tokens no localStorage de forma segura
      try {
        secureStorage.setItem("token", token);
        secureStorage.setItem("refreshToken", refreshToken);
        secureStorage.setItem("user", user);
        
        // Log de login bem-sucedido (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
          console.log('🔒 Login bem-sucedido:', { userId: user?.id || 'unknown', userEmail: user?.email || 'unknown' });
        }
        
        // Log de segurança
        logSecurityEvent('login_success', {
          userId: user.id,
          userEmail: user.email
        });
        
      } catch (storageError) {
        console.error('Erro ao salvar dados no localStorage:', storageError);
        throw new Error('Erro ao salvar dados de autenticação');
      }
      
      // Configurar token para todas as requisições
      try {
        setAuthToken(token);
      } catch (tokenError) {
        console.error('Erro ao configurar token:', tokenError);
        throw new Error('Erro ao configurar autenticação');
      }
      
      return { success: true, user, token, refreshToken };
    } catch (error) {
      // Log detalhado do erro para debug
      if (process.env.NODE_ENV === 'development') {
        console.error('🔒 Erro no login:', {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack
        });
      }
      
      // Log de tentativa de login falhada apenas se for um erro real
      if (error.response?.status >= 400) {
        logSecurityEvent('login_failed', { 
          email: email,
          error: error.message,
          status: error.response?.status
        });
      }
      
      // Se o erro já tem uma mensagem específica, usar ela
      if (error.userMessage || error.response?.data?.message) {
        throw new Error(error.userMessage || error.response?.data?.message);
      }
      
      // Se for um erro de validação ou estrutura, usar mensagem específica
      if (error.message === 'Resposta inválida do servidor' || 
          error.message === 'Dados de autenticação incompletos' ||
          error.message === 'Email inválido' ||
          error.message === 'Senha deve ter pelo menos 4 caracteres') {
        throw new Error(error.message);
      }
      
      throw new Error("Erro ao fazer login");
    }
  }

  /**
   * Fazer logout do usuário
   */
  async logout() {
    try {
      // Log de logout bem-sucedido
      const user = this.getUser();
      if (user && user.id && user.email) {
        logSecurityEvent('logout_success', { 
          userId: user.id, 
          userEmail: user.email 
        });
      } else if (user) {
        // Log com dados parciais se disponíveis
        logSecurityEvent('logout_success', { 
          userId: user.id || 'unknown',
          userEmail: user.email || 'unknown'
        });
      }

      // Chamar repositório para logout
      await this.repository.logout();
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
      logSecurityEvent('logout_error', { error: error.message });
    } finally {
      // Sempre limpar dados locais, independente do resultado
      try {
        secureStorage.removeItem("token");
        secureStorage.removeItem("refreshToken");
        secureStorage.removeItem("user");

        clearAuthToken();
        
        // Disparar evento de logout para notificar outros componentes
        const currentUser = this.getUser();
        window.dispatchEvent(new CustomEvent('auth:logout', {
          detail: {
            timestamp: Date.now(),
            reason: 'user_logout',
            userId: currentUser?.id || null
          }
        }));
      } catch (cleanupError) {
        console.error('Erro ao limpar dados locais:', cleanupError);
      }
    }
  }

  /**
   * Obter token atual
   */
  getToken() {
    return secureStorage.getItem("token");
  }

  /**
   * Obter usuário atual
   */
  getUser() {
    try {
      const user = secureStorage.getItem("user") || localStorage.getItem("user");
      if (!user) return null;
      
      const parsedUser = typeof user === 'string' ? JSON.parse(user) : user;
      
      // Verificar se o usuário tem as propriedades essenciais
      if (parsedUser && typeof parsedUser === 'object') {
        return parsedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Configurar interceptor para adicionar token automaticamente
   */
  setupAuthInterceptor() {
    const token = this.getToken();
    if (token) {
      setAuthToken(token);
    }
  }

  /**
   * Renovar token
   */
  async refreshToken() {
    try {
      const refreshToken = secureStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const result = await this.repository.refreshToken(refreshToken);
      const { accessToken: newToken, refreshToken: newRefreshToken } = result.data;
      
      // Atualizar tokens
      secureStorage.setItem('token', newToken);
      secureStorage.setItem('refreshToken', newRefreshToken);
      setAuthToken(newToken);
      
      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      // Se o erro já tem uma mensagem específica, usar ela
      if (error.message === 'Refresh token não encontrado') {
        throw new Error(error.message);
      }
      
      // Se for um erro do repositório, propagar a mensagem
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Erro ao renovar token');
    }
  }

  /**
   * Validar token atual
   */
  async validateToken() {
    try {
      return await this.repository.validateToken();
    } catch (error) {
      return { valid: false, user: null };
    }
  }

  /**
   * Obter estatísticas de autenticação (admin)
   */
  async getAuthStats() {
    try {
      return await this.repository.getAuthStats();
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas');
    }
  }

  /**
   * Alterar senha
   */
  async changePassword(passwordData) {
    try {
      // Validação de negócio
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error('Senha atual e nova senha são obrigatórias');
      }

      if (passwordData.newPassword.length < 4) {
        throw new Error('Nova senha deve ter pelo menos 4 caracteres');
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Nova senha e confirmação não coincidem');
      }

      return await this.repository.changePassword(passwordData);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Erro ao alterar senha');
    }
  }

  /**
   * Solicitar reset de senha
   */
  async requestPasswordReset(email) {
    try {
      if (!validateEmail(email)) {
        throw new Error('Email inválido');
      }

      return await this.repository.requestPasswordReset(email);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Erro ao solicitar reset de senha');
    }
  }

  /**
   * Resetar senha com token
   */
  async resetPassword(token, newPassword) {
    try {
      if (!token) {
        throw new Error('Token de reset é obrigatório');
      }

      if (!newPassword || newPassword.length < 4) {
        throw new Error('Nova senha deve ter pelo menos 4 caracteres');
      }

      return await this.repository.resetPassword(token, newPassword);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Erro ao resetar senha');
    }
  }
}

const authService = new AuthService();
export default authService;

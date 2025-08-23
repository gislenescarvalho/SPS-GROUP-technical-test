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
      
      // Chamar repositório para login
      const result = await this.repository.login({
        email: email.toLowerCase().trim(),
        password,
      });
      
      const { user, token, refreshToken } = result;
      
      // Salvar tokens no localStorage de forma segura
      secureStorage.setItem("token", token);
      secureStorage.setItem("refreshToken", refreshToken);
      secureStorage.setItem("user", user);
      
      // Configurar token para todas as requisições
      setAuthToken(token);
      
      // Log de login bem-sucedido
      logSecurityEvent('login_success', { 
        userId: user.id, 
        userEmail: user.email 
      });
      
      return { user, token, refreshToken };
    } catch (error) {
      // Log de tentativa de login falhada
      logSecurityEvent('login_failed', { 
        email: email,
        error: error.message 
      });
      
      throw new Error(error.userMessage || error.response?.data?.message || "Erro ao fazer login");
    }
  }

  /**
   * Realizar logout
   */
  async logout() {
    try {
      // Log de logout bem-sucedido
      const user = this.getUser();
      if (user) {
        logSecurityEvent('logout_success', { 
          userId: user.id, 
          userEmail: user.email 
        });
      }

      // Chamar repositório para logout
      await this.repository.logout();
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
      logSecurityEvent('logout_error', { error: error.message });
    } finally {
      // Limpar dados locais independente do resultado
      secureStorage.removeItem("token");
      secureStorage.removeItem("refreshToken");
      secureStorage.removeItem("user");
      clearAuthToken();
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
    const user = secureStorage.getItem("user");
    return user ? (typeof user === 'string' ? JSON.parse(user) : user) : null;
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
      const { token: newToken, refreshToken: newRefreshToken } = result;
      
      // Atualizar tokens
      secureStorage.setItem('token', newToken);
      secureStorage.setItem('refreshToken', newRefreshToken);
      setAuthToken(newToken);
      
      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao renovar token');
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

export default new AuthService();

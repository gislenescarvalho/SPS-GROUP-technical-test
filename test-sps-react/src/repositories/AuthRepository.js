import api from '../services/httpInterceptor';
import config from '../config/api';

/**
 * Repositório para operações de autenticação
 * Abstrai o acesso aos dados de autenticação
 */
class AuthRepository {
  constructor() {
    this.baseURL = config.baseURL;
  }

  /**
   * Realizar login
   */
  async login(credentials) {
    const response = await api.post(config.endpoints.auth.login, credentials);
    return response.data;
  }

  /**
   * Realizar logout
   */
  async logout() {
    try {
      await api.post(config.endpoints.auth.logout);
      return true;
    } catch (error) {
      console.error('Erro no logout:', error);
      return false;
    }
  }

  /**
   * Renovar token
   */
  async refreshToken(refreshToken) {
    const response = await api.post(config.endpoints.auth.refresh, { refreshToken });
    return response.data;
  }

  /**
   * Verificar se token é válido
   */
  async validateToken() {
    try {
      const response = await api.get(config.endpoints.auth.validate);
      return response.data;
    } catch (error) {
      return { valid: false, user: null };
    }
  }

  /**
   * Obter estatísticas de autenticação
   */
  async getAuthStats() {
    try {
      const response = await api.get(config.endpoints.auth.stats);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de auth:', error);
      return null;
    }
  }

  /**
   * Alterar senha
   */
  async changePassword(passwordData) {
    const response = await api.post(config.endpoints.auth.changePassword, passwordData);
    return response.data;
  }

  /**
   * Solicitar reset de senha
   */
  async requestPasswordReset(email) {
    const response = await api.post(config.endpoints.auth.requestReset, { email });
    return response.data;
  }

  /**
   * Resetar senha com token
   */
  async resetPassword(token, newPassword) {
    const response = await api.post(config.endpoints.auth.resetPassword, { 
      token, 
      newPassword 
    });
    return response.data;
  }
}

export default new AuthRepository();


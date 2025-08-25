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
      // Tentar fazer logout no servidor
      await api.post(config.endpoints.auth.logout);
      return true;
    } catch (error) {
      // Se falhar, ainda considerar logout bem-sucedido
      // (pode ser token expirado, mas o usuário quer sair mesmo assim)
      console.log('Logout no servidor falhou, mas continuando com limpeza local:', error.message);
      return true;
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

const authRepository = new AuthRepository();
export default authRepository;


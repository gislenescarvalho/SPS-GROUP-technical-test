import api from '../services/httpInterceptor';
import config from '../config/api';

/**
 * Repositório para operações de usuários
 * Abstrai o acesso aos dados e implementa padrão Repository
 */
class UserRepository {
  constructor() {
    this.baseURL = config.baseURL;
  }

  /**
   * Listar usuários com paginação e filtros
   */
  async findAll(params = {}) {
    const { page = config.pagination.defaultPage, limit = config.pagination.defaultLimit, search = '' } = params;
    
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    
    const url = `${config.endpoints.users.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Buscar usuário por ID
   */
  async findById(id) {
    const response = await api.get(config.endpoints.users.get(id));
    return response.data;
  }

  /**
   * Criar novo usuário
   */
  async create(userData) {
    const response = await api.post(config.endpoints.users.create, userData);
    return response.data;
  }

  /**
   * Atualizar usuário
   */
  async update(id, userData) {
    console.log('🔍 UserRepository.update chamado:', { id, userData });
    const response = await api.put(config.endpoints.users.update(id), userData);
    return response.data;
  }

  /**
   * Deletar usuário
   */
  async delete(id) {
    await api.delete(config.endpoints.users.delete(id));
    return true;
  }

  /**
   * Verificar se email já existe
   */
  async checkEmailExists(email, excludeUserId = null) {
    try {
      const result = await this.findAll();
      const users = result.users || result; // Suportar tanto {users: [...]} quanto [...]
      const existingUser = users.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.id !== excludeUserId
      );
      return !!existingUser;
    } catch (error) {
      console.error('❌ Erro ao verificar email:', error);
      return false;
    }
  }

  /**
   * Buscar usuários por critérios
   */
  async findByCriteria(criteria = {}) {
    const { name, email, type } = criteria;
    const queryParams = new URLSearchParams();
    
    if (name) queryParams.append('name', name);
    if (email) queryParams.append('email', email);
    if (type) queryParams.append('type', type);
    
    const url = `${config.endpoints.users.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    const result = response.data;
    return result.users || result; // Suportar tanto {users: [...]} quanto [...]
  }

  /**
   * Contar total de usuários
   */
  async count() {
    try {
      const result = await this.findAll({ limit: 1 });
      return result.pagination?.total || 0;
    } catch (error) {
      console.error('Erro ao contar usuários:', error);
      return 0;
    }
  }
}

export default new UserRepository();


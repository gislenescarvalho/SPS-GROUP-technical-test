import UserRepository from '../repositories/UserRepository';

/**
 * Serviço para operações de usuários
 * Implementa a lógica de negócio usando o repositório
 */
class UserService {
  constructor() {
    this.repository = UserRepository;
  }

  /**
   * Listar usuários com paginação e filtros
   */
  async list(params = {}) {
    try {
      return await this.repository.findAll(params);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao listar usuários");
    }
  }

  /**
   * Buscar usuário por ID
   */
  async get(id) {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao buscar usuário");
    }
  }

  /**
   * Criar novo usuário
   */
  async create(data) {
    try {
      // Validação de negócio
      const validation = await this.validateUserData(data, false);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
      }

      return await this.repository.create(data);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Erro ao criar usuário");
    }
  }

  /**
   * Atualizar usuário
   */
  async update(id, data) {
    try {
      // Validação de negócio
      const validation = await this.validateUserData(data, true, id);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
      }

      // Verificar se usuário existe
      const existingUser = await this.repository.findById(id);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      return await this.repository.update(id, data);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Erro ao atualizar usuário");
    }
  }

  /**
   * Deletar usuário
   */
  async delete(id) {
    try {
      // Verificar se usuário existe
      const existingUser = await this.repository.findById(id);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se não é o último admin
      if (existingUser.type === 'admin') {
        const adminCount = await this.getAdminCount();
        if (adminCount <= 1) {
          throw new Error('Não é possível deletar o último administrador');
        }
      }

      return await this.repository.delete(id);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Erro ao deletar usuário");
    }
  }

  /**
   * Verificar se email já existe
   */
  async checkEmailExists(email, excludeUserId = null) {
    try {
      return await this.repository.checkEmailExists(email, excludeUserId);
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  /**
   * Buscar usuários por critérios
   */
  async findByCriteria(criteria) {
    try {
      return await this.repository.findByCriteria(criteria);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao buscar usuários");
    }
  }

  /**
   * Contar total de usuários
   */
  async count() {
    try {
      return await this.repository.count();
    } catch (error) {
      console.error('Erro ao contar usuários:', error);
      return 0;
    }
  }

  /**
   * Contar administradores
   */
  async getAdminCount() {
    try {
      const admins = await this.repository.findByCriteria({ type: 'admin' });
      return admins.length;
    } catch (error) {
      console.error('Erro ao contar administradores:', error);
      return 0;
    }
  }

  /**
   * Validar dados do usuário
   */
  async validateUserData(data, isUpdate = false, userId = null) {
    const errors = {};

    // Validação básica
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.email = 'Email deve ter um formato válido';
    }

    if (!isUpdate && (!data.password || data.password.length < 4)) {
      errors.password = 'Senha deve ter pelo menos 4 caracteres';
    }

    if (!data.type || !['user', 'admin'].includes(data.type)) {
      errors.type = 'Tipo deve ser "user" ou "admin"';
    }

    // Verificar email duplicado
    if (data.email) {
      const emailExists = await this.checkEmailExists(data.email, userId);
      if (emailExists) {
        errors.email = 'Este email já está em uso por outro usuário';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validar email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default new UserService();

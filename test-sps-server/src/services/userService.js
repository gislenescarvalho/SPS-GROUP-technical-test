const database = require('../database/fakeDatabase');
const redisService = require('./redisService');
const auditService = require('./auditService');
const config = require('../config');
const paginationService = require('../utils/pagination');

class UserService {
  // Listar todos os usuários com paginação otimizada
  async getAllUsers(page = 1, limit = 10, filters = {}) {
    try {
      const startTime = Date.now();
      const users = database.getAllUsers();
      
      // Usar paginação otimizada com cache
      const result = await paginationService.paginateWithCache(users, page, limit, {
        cacheKey: 'users',
        filters,
        ttl: config.cache.userTTL,
        enableCache: true
      });
      
      // Adicionar links de paginação
      const baseUrl = '/api/users';
      const queryParams = { ...filters };
      result.links = paginationService.generatePaginationLinks(baseUrl, result.pagination, queryParams);
      
      // Registrar métrica de performance
      const duration = Date.now() - startTime;
      await redisService.incrementMetric('user_query_duration', duration);
      await redisService.incrementMetric('user_queries_total');
      
      return {
        users: result.data,
        pagination: result.pagination,
        links: result.links,
        meta: result.meta
      };
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error.message);
      // Fallback para busca direta sem cache
      const users = database.getAllUsers();
      return paginationService.simplePaginate(users, page, limit);
    }
  }

  // Buscar usuário por ID com cache
  async getUserById(id) {
    const cacheKey = `user:${id}`;
    
    try {
      // Tentar buscar do cache primeiro
      const cached = await redisService.get(cacheKey);
      if (cached) {
        await redisService.incrementMetric('cache_hits');
        return cached;
      }
      
      // Se não estiver no cache, buscar do banco
      const startTime = Date.now();
      const user = database.getUserById(id);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Cachear resultado
      await redisService.set(cacheKey, user, config.cache.userTTL);
      await redisService.incrementMetric('cache_misses');
      
      // Registrar métrica de performance
      const duration = Date.now() - startTime;
      await redisService.incrementMetric('query_duration', duration);
      
      return user;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error.message);
      // Fallback para busca direta sem cache
      const user = database.getUserById(id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      return user;
    }
  }

  // Criar novo usuário
  async createUser(userData, auditContext = {}) {
    // Validação dos campos obrigatórios
    if (!userData.name || !userData.email || !userData.type || !userData.password) {
      throw new Error('Todos os campos são obrigatórios: name, email, type, password');
    }

    // Validação do tipo de usuário
    if (!['admin', 'user'].includes(userData.type)) {
      throw new Error('Tipo de usuário deve ser "admin" ou "user"');
    }

    // Validação de email único
    if (database.emailExists(userData.email)) {
      throw new Error('Email já cadastrado');
    }

    const startTime = Date.now();
    const newUser = await database.createUser(userData);
    
    // Invalidar cache relacionado
    await this.invalidateUserCache();
    
    // Registrar métrica
    const duration = Date.now() - startTime;
    await redisService.incrementMetric('user_creation_duration', duration);
    await redisService.incrementMetric('users_created');
    
    // Auditoria (se contexto fornecido)
    if (auditContext.userId) {
      await auditService.logUserAction(
        auditContext.userId,
        auditContext.userEmail,
        auditContext.userType,
        'user_created',
        'users',
        newUser.id,
        {
          createdUser: { name: userData.name, email: userData.email, type: userData.type },
          ipAddress: auditContext.ipAddress
        }
      );
    }
    
    return newUser;
  }

  // Atualizar usuário
  async updateUser(id, userData, auditContext = {}) {
    // Verificar se usuário existe
    const existingUser = database.getUserById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Validação do tipo de usuário se fornecido
    if (userData.type && !['admin', 'user'].includes(userData.type)) {
      throw new Error('Tipo de usuário deve ser "admin" ou "user"');
    }

    // Validação de email único se fornecido
    if (userData.email && database.emailExists(userData.email, parseInt(id))) {
      throw new Error('Email já cadastrado');
    }

    const startTime = Date.now();
    const updatedUser = await database.updateUser(id, userData);
    
    if (!updatedUser) {
      throw new Error('Usuário não encontrado');
    }

    // Invalidar cache relacionado
    await this.invalidateUserCache(id);
    
    // Registrar métrica
    const duration = Date.now() - startTime;
    await redisService.incrementMetric('user_update_duration', duration);
    await redisService.incrementMetric('users_updated');

    // Auditoria (se contexto fornecido)
    if (auditContext.userId) {
      await auditService.logUserAction(
        auditContext.userId,
        auditContext.userEmail,
        auditContext.userType,
        'user_updated',
        'users',
        id,
        {
          updatedUser: userData,
          ipAddress: auditContext.ipAddress
        }
      );
    }

    return updatedUser;
  }

  // Deletar usuário
  async deleteUser(id, auditContext = {}) {
    // Verificar se usuário existe
    const existingUser = database.getUserById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Não permitir deletar o usuário admin
    if (existingUser.type === 'admin' && existingUser.email === 'admin@spsgroup.com.br') {
      throw new Error('Não é possível deletar o usuário admin principal');
    }

    const startTime = Date.now();
    const deleted = database.deleteUser(id);
    
    if (!deleted) {
      throw new Error('Usuário não encontrado');
    }

    // Invalidar cache relacionado
    await this.invalidateUserCache(id);
    
    // Registrar métrica
    const duration = Date.now() - startTime;
    await redisService.incrementMetric('user_deletion_duration', duration);
    await redisService.incrementMetric('users_deleted');

    // Auditoria (se contexto fornecido)
    if (auditContext.userId) {
      await auditService.logUserAction(
        auditContext.userId,
        auditContext.userEmail,
        auditContext.userType,
        'user_deleted',
        'users',
        id,
        {
          deletedUser: existingUser,
          ipAddress: auditContext.ipAddress
        }
      );
    }

    return true;
  }

  // Invalidar cache de usuários
  async invalidateUserCache(userId = null) {
    try {
      // Invalidar cache de paginação
      await paginationService.invalidatePaginationCache('users');
      
      // Invalidar cache específico do usuário se fornecido
      if (userId) {
        await redisService.del(`user:${userId}`);
      }
      
      console.log('🗑️ Cache de usuários invalidado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao invalidar cache:', error.message);
    }
  }
}

module.exports = new UserService();

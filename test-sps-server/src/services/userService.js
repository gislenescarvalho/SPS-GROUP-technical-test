const database = require('../database/fakeDatabase');
const NodeCache = require('node-cache');

// Cache em memória para usuários
const userCache = new NodeCache({
  stdTTL: 600, // 10 minutos padrão
  checkperiod: 120,
  useClones: false
});
const auditService = require('./auditService');
const config = require('../config');
const paginationService = require('../utils/pagination');

class UserService {
  async getAllUsers(page = 1, limit = 10, filters = {}) {
    try {
      const startTime = Date.now();
      const users = database.getAllUsers();
      
      const result = await paginationService.paginateWithCache(users, page, limit, {
        cacheKey: 'users',
        filters,
        ttl: config.cache.userTTL,
        enableCache: true
      });
      
      const baseUrl = '/api/users';
      const queryParams = { ...filters };
      result.links = paginationService.generatePaginationLinks(baseUrl, result.pagination, queryParams);
    
      
      return {
        users: result.data,
        pagination: result.pagination,
        links: result.links,
        meta: result.meta
      };
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error.message);
      const users = database.getAllUsers();
      return paginationService.simplePaginate(users, page, limit);
    }
  }

  async getUserById(id) {
    const cacheKey = `user:${id}`;
    
    try {
      const cached = userCache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      const startTime = Date.now();
      const user = database.getUserById(id);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      userCache.set(cacheKey, user, config.cache.userTTL);
      
      return user;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error.message);
      const user = database.getUserById(id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      return user;
    }
  }

  async createUser(userData, auditContext = {}) {
    if (!userData.name || !userData.email || !userData.type || !userData.password) {
      throw new Error('Todos os campos são obrigatórios: name, email, type, password');
    }

    if (!['admin', 'user'].includes(userData.type)) {
      throw new Error('Tipo de usuário deve ser "admin" ou "user"');
    }

    if (database.emailExists(userData.email)) {
      throw new Error('Email já cadastrado');
    }

    const startTime = Date.now();
    const newUser = await database.createUser(userData);
    
    await this.invalidateUserCache();
    

    
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

  async updateUser(id, userData, auditContext = {}) {
    const existingUser = database.getUserById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    if (userData.type && !['admin', 'user'].includes(userData.type)) {
      throw new Error('Tipo de usuário deve ser "admin" ou "user"');
    }

    if (userData.email && database.emailExists(userData.email, parseInt(id))) {
      throw new Error('Email já cadastrado');
    }

    const startTime = Date.now();
    const updatedUser = await database.updateUser(id, userData);
    
    if (!updatedUser) {
      throw new Error('Usuário não encontrado');
    }

    await this.invalidateUserCache(id);
    


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

  async deleteUser(id, auditContext = {}) {
    const existingUser = database.getUserById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    if (existingUser.type === 'admin' && existingUser.email === 'admin@spsgroup.com.br') {
      throw new Error('Não é possível deletar o usuário admin principal');
    }

    const startTime = Date.now();
    const deleted = database.deleteUser(id);
    
    if (!deleted) {
      throw new Error('Usuário não encontrado');
    }

    await this.invalidateUserCache(id);
    


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

  async invalidateUserCache(userId = null) {
    try {
      await paginationService.invalidatePaginationCache('users');
      
      if (userId) {
        userCache.del(`user:${userId}`);
      }
      
      console.log('🗑️ Cache de usuários invalidado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao invalidar cache:', error.message);
    }
  }
}

module.exports = new UserService();

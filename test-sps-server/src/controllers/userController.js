const userService = require('../services/userService');
const auditService = require('../services/auditService');

class UserController {
  // Listar todos os usuários
  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Extrair filtros da query string
      const filters = {};
      if (req.query.name) filters.name = req.query.name;
      if (req.query.email) filters.email = req.query.email;
      if (req.query.type) filters.type = req.query.type;
      
      const result = await userService.getAllUsers(page, limit, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Buscar usuário por ID
  async getUserById(req, res, next) {
    try {
      const { id } = req.params; // ID já validado pelo middleware
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Criar novo usuário
  async createUser(req, res, next) {
    try {
      const { name, email, type, password } = req.body; // Dados já validados pelo Joi
      
      // Contexto de auditoria
      const auditContext = {
        userId: req.user?.id,
        userEmail: req.user?.email,
        userType: req.user?.type,
        ipAddress: req.ip
      };
      
      const newUser = await userService.createUser({ name, email, type, password }, auditContext);
      
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  // Atualizar usuário
  async updateUser(req, res, next) {
    try {
      const { id } = req.params; // ID já validado pelo middleware
      const updateData = req.body; // Dados já validados pelo Joi

      // Contexto de auditoria
      const auditContext = {
        userId: req.user?.id,
        userEmail: req.user?.email,
        userType: req.user?.type,
        ipAddress: req.ip
      };

      const updatedUser = await userService.updateUser(id, updateData, auditContext);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  // Deletar usuário
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params; // ID já validado pelo middleware
      
      // Contexto de auditoria
      const auditContext = {
        userId: req.user?.id,
        userEmail: req.user?.email,
        userType: req.user?.type,
        ipAddress: req.ip
      };
      
      await userService.deleteUser(id, auditContext);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

const userService = require('../services/userService');

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
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

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { name, email, type, password } = req.body;
      
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

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

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

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
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

const userService = require('../services/userService');

class UserController {
  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Listar usuários
   *     description: Retorna lista paginada de usuários com filtros opcionais
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *           maximum: 100
   *         description: Número de itens por página
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: Filtrar por nome
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *         description: Filtrar por email
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [admin, user]
   *         description: Filtrar por tipo de usuário
   *     responses:
   *       200:
   *         description: Lista de usuários obtida com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginationResponse'
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       400:
   *         description: Parâmetros inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Buscar usuário por ID
   *     description: Retorna dados de um usuário específico
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *     responses:
   *       200:
   *         description: Usuário encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: ID inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Criar usuário
   *     description: Cria um novo usuário no sistema
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - type
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 description: Nome completo do usuário
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email do usuário
   *               type:
   *                 type: string
   *                 enum: [admin, user]
   *                 description: Tipo do usuário
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 description: Senha do usuário (mínimo 8 caracteres)
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Atualizar usuário
   *     description: Atualiza dados de um usuário existente
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             minProperties: 1
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 description: Nome completo do usuário
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email do usuário
   *               type:
   *                 type: string
   *                 enum: [admin, user]
   *                 description: Tipo do usuário
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 description: Nova senha do usuário
   *     responses:
   *       200:
   *         description: Usuário atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Deletar usuário
   *     description: Remove um usuário do sistema
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *     responses:
   *       204:
   *         description: Usuário deletado com sucesso
   *       400:
   *         description: ID inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Não é possível deletar o usuário admin principal
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

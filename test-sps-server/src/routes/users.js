const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateId, validatePagination, validateSearch } = require('../middleware/validation');
const { createUserSchema, updateUserSchema } = require('../validations/schemas');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');

const userRoutes = Router();

// Aplicar middleware de autenticação em todas as rotas
userRoutes.use(authenticateToken);

// GET /users - Listar todos os usuários com paginação e busca
userRoutes.get('/', validateSearch, cacheMiddleware(), userController.getAllUsers);

// GET /users/:id - Buscar usuário por ID
userRoutes.get('/:id', validateId, cacheMiddleware(), userController.getUserById);

// POST /users - Criar novo usuário com validação
userRoutes.post('/', validateBody(createUserSchema), invalidateCache(['users:*', 'user:*']), userController.createUser);

// PUT /users/:id - Atualizar usuário com validação
userRoutes.put('/:id', validateId, validateBody(updateUserSchema), invalidateCache(['users:*', 'user:*']), userController.updateUser);

// DELETE /users/:id - Deletar usuário
userRoutes.delete('/:id', validateId, invalidateCache(['users:*', 'user:*']), userController.deleteUser);

module.exports = userRoutes;

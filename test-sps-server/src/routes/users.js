const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody, validateId, validateSearch } = require('../middleware/validation');
const { createUserSchema, updateUserSchema } = require('../validations/schemas');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');

const userRoutes = Router();

userRoutes.use(authenticateToken);

userRoutes.get('/', validateSearch, cacheMiddleware(), userController.getAllUsers);

userRoutes.get('/:id', validateId, cacheMiddleware(), userController.getUserById);

userRoutes.post('/', validateBody(createUserSchema), invalidateCache(['users:*', 'user:*']), userController.createUser);

userRoutes.put('/:id', validateId, validateBody(updateUserSchema), invalidateCache(['users:*', 'user:*']), userController.updateUser);

userRoutes.delete('/:id', validateId, invalidateCache(['users:*', 'user:*']), userController.deleteUser);

module.exports = userRoutes;

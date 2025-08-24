const { Router } = require('express');
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { loginSchema, refreshTokenSchema } = require('../validations/schemas');

const authRoutes = Router();

authRoutes.post('/login', validateBody(loginSchema), authController.login);

authRoutes.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);

authRoutes.post('/logout', authenticateToken, authController.logout);

authRoutes.get('/stats', authenticateToken, authController.getAuthStats);

authRoutes.post('/cleanup', authenticateToken, authController.cleanupTokens);

module.exports = authRoutes;

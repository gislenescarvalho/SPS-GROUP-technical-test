const { Router } = require('express');
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { loginSchema, refreshTokenSchema } = require('../validations/schemas');

const authRoutes = Router();

// POST /auth/login - Login do usuário
authRoutes.post('/login', validateBody(loginSchema), authController.login);

// POST /auth/refresh - Renovar token
authRoutes.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);

// POST /auth/logout - Logout do usuário
authRoutes.post('/logout', authenticateToken, authController.logout);

// GET /auth/stats - Estatísticas de autenticação (admin)
authRoutes.get('/stats', authenticateToken, authController.getAuthStats);

// POST /auth/cleanup - Limpar tokens expirados (admin)
authRoutes.post('/cleanup', authenticateToken, authController.cleanupTokens);

module.exports = authRoutes;

const authService = require('../services/authService');
const auditService = require('../services/auditService');

class AuthController {
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Autenticar usuário
   *     description: Realiza login do usuário com email e senha
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: Dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Credenciais inválidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Login do usuário
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.authenticateUser(email, password);
      
      // Registrar log de auditoria
      await auditService.logLogin(
        result.user.id,
        result.user.email,
        result.user.type,
        true,
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      );
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      });
    } catch (error) {
      // Registrar tentativa de login falhada
      await auditService.logLogin(
        null,
        req.body.email,
        null,
        false,
        {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          errorMessage: error.message
        }
      );
      
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     summary: Renovar token de acesso
   *     description: Renova o token de acesso usando um refresh token válido
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: Token de renovação
   *     responses:
   *       200:
   *         description: Token renovado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     accessToken:
   *                       type: string
   *                     refreshToken:
   *                       type: string
   *                     expiresIn:
   *                       type: integer
   *       400:
   *         description: Refresh token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Renovar token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token é obrigatório'
        });
      }

      const result = await authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Fazer logout
   *     description: Invalida o token de acesso e faz logout do usuário
   *     tags: [Autenticação]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: Token de renovação para invalidar (opcional)
   *     responses:
   *       200:
   *         description: Logout realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Logout do usuário
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.id;

      // Se não há usuário autenticado, ainda permitir logout (pode ser token expirado)
      if (!userId) {
        // Logout sem autenticação (token expirado ou inválido)
        console.log('Logout sem autenticação - token pode estar expirado');
        
        res.json({
          success: true,
          message: 'Logout realizado com sucesso'
        });
        return;
      }

      await authService.logout(userId, refreshToken);
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      // Em caso de erro, ainda retornar sucesso para logout
      console.error('Erro durante logout:', error.message);
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    }
  }

  /**
   * @swagger
   * /auth/stats:
   *   get:
   *     summary: Obter estatísticas de autenticação
   *     description: Retorna estatísticas sobre sessões ativas e autenticação
   *     tags: [Autenticação]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Estatísticas obtidas com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     activeSessions:
   *                       type: integer
   *                       description: Número de sessões ativas
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Obter estatísticas de autenticação
  async getAuthStats(req, res, next) {
    try {
      const stats = await authService.getAuthStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/cleanup:
   *   post:
   *     summary: Limpar tokens expirados
   *     description: Remove tokens expirados do sistema (endpoint administrativo)
   *     tags: [Autenticação]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Limpeza iniciada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // Limpar tokens expirados (endpoint administrativo)
  async cleanupTokens(req, res, next) {
    try {
      await authService.cleanupExpiredTokens();
      
      res.json({
        success: true,
        message: 'Limpeza de tokens iniciada'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

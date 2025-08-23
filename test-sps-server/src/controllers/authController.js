const authService = require('../services/authService');
const auditService = require('../services/auditService');

class AuthController {
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

  // Logout do usuário
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado'
        });
      }

      await authService.logout(userId, refreshToken);
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

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

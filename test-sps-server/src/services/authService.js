const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const database = require('../database/fakeDatabase');
const config = require('../config');
const NodeCache = require('node-cache');

// Cache em memória para tokens de refresh
const tokenCache = new NodeCache({
  stdTTL: 7 * 24 * 3600, // 7 dias padrão
  checkperiod: 3600,
  useClones: false
});

class AuthService {
  // Gerar token de acesso
  generateAccessToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        type: user.type 
        // Removido: email para reduzir tamanho
      },
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn,
        algorithm: 'HS256' // Usar algoritmo mais eficiente
      }
    );
  }

  // Gerar refresh token
  generateRefreshToken(user) {
    const refreshToken = jwt.sign(
      { 
        id: user.id, 
        type: 'refresh'
        // Removido: email para reduzir tamanho
      },
      config.jwt.secret,
      { 
        expiresIn: config.jwt.refreshExpiresIn,
        algorithm: 'HS256' // Usar algoritmo mais eficiente
      }
    );

    // Armazenar refresh token em memória com TTL
    const ttl = this.getTokenTTL(config.jwt.refreshExpiresIn);
    tokenCache.set(`refresh_token:${user.id}`, refreshToken, ttl);
    
    return refreshToken;
  }

  // Calcular TTL em segundos
  getTokenTTL(expiresIn) {
    const units = {
      's': 1,
      'm': 60,
      'h': 3600,
      'd': 86400
    };
    
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const [, value, unit] = match;
      return parseInt(value) * units[unit];
    }
    
    return 7 * 24 * 3600; // 7 dias padrão
  }

  // Autenticar usuário
  async authenticateUser(email, password) {
    const user = database.getUserByEmail(email);
    
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Comparar senha usando bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type
      },
      accessToken,
      refreshToken,
      expiresIn: this.getTokenTTL(config.jwt.expiresIn)
    };
  }

  // Renovar token usando refresh token
  async refreshToken(refreshToken) {
    try {
      // Verificar se o refresh token é válido
      const decoded = jwt.verify(refreshToken, config.jwt.secret);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Token inválido');
      }

      // Verificar se o refresh token está armazenado em memória
      const storedToken = tokenCache.get(`refresh_token:${decoded.id}`);
      
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Refresh token inválido ou expirado');
      }

      // Buscar usuário
      const user = database.getUserById(decoded.id);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Gerar novos tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Invalidar refresh token antigo
      tokenCache.del(`refresh_token:${decoded.id}`);



      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getTokenTTL(config.jwt.expiresIn)
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Refresh token inválido');
      }
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expirado');
      }
      throw error;
    }
  }

  // Fazer logout (invalidar tokens)
  async logout(userId, refreshToken = null) {
    try {
      // Invalidar refresh token se fornecido
      if (refreshToken) {
        tokenCache.del(`refresh_token:${userId}`);
      }

      // Adicionar token de acesso à blacklist (opcional)
      // tokenCache.set(`blacklist:${accessToken}`, 'true', 3600);



      return true;
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error.message);
      return false;
    }
  }

  // Verificar se token está na blacklist
  async isTokenBlacklisted(token) {
    try {
      const blacklisted = tokenCache.get(`blacklist:${token}`);
      return !!blacklisted;
    } catch (error) {
      return false;
    }
  }

  // Limpar tokens expirados
  async cleanupExpiredTokens() {
    try {
      // Esta funcionalidade seria implementada com um job agendado
      // Por enquanto, apenas log
      console.log('🧹 Limpeza de tokens expirados executada');
    } catch (error) {
      console.error('❌ Erro na limpeza de tokens:', error.message);
    }
  }

  // Obter estatísticas de autenticação
  async getAuthStats() {
    try {
      return {
        activeSessions: await this.getActiveSessionsCount()
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de auth:', error.message);
      return {};
    }
  }

  // Contar sessões ativas
  async getActiveSessionsCount() {
    try {
      const keys = tokenCache.keys();
      const refreshTokens = keys.filter(key => key.startsWith('refresh_token:'));
      return refreshTokens.length;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = new AuthService();

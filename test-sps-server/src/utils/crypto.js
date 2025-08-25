const crypto = require('crypto');

/**
 * Utilitário de criptografia para o backend
 * Processa senhas criptografadas do frontend
 */
class CryptoUtils {
  /**
   * Verificar senha criptografada do frontend
   */
  static verifyFrontendPassword(passwordHash, salt, iterations, keyLength, digest, sessionSalt) {
    try {
      // Combinar salt da sessão com salt da operação
      const combinedSalt = sessionSalt + salt;
      
      // Gerar hash usando PBKDF2
      const testHash = crypto.pbkdf2Sync(
        passwordHash, // O frontend já envia o hash
        combinedSalt,
        iterations,
        keyLength,
        digest
      ).toString('hex');

      return testHash === passwordHash;
    } catch (error) {
      console.error('Erro ao verificar senha criptografada:', error);
      return false;
    }
  }

  /**
   * Gerar hash BCrypt para armazenamento no banco
   */
  static async hashForStorage(password, bcryptRounds = 12) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.hash(password, bcryptRounds);
  }

  /**
   * Verificar senha BCrypt armazenada
   */
  static async verifyStoredPassword(password, hashedPassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Gerar salt único
   */
  static generateSalt(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Gerar token de segurança
   */
  static generateSecurityToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Criptografar dados sensíveis
   */
  static encryptData(data, key) {
    try {
      const cipher = crypto.createCipher('aes-256-cbc', key);
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Erro ao criptografar dados:', error);
      throw new Error('Falha na criptografia dos dados');
    }
  }

  /**
   * Descriptografar dados sensíveis
   */
  static decryptData(encryptedData, key) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Erro ao descriptografar dados:', error);
      throw new Error('Falha na descriptografia dos dados');
    }
  }
}

module.exports = CryptoUtils;

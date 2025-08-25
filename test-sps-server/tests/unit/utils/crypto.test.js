const CryptoUtils = require('../../../src/utils/crypto');

describe('CryptoUtils', () => {
  describe('verifyFrontendPassword', () => {
    test('deve verificar senha criptografada do frontend corretamente', () => {
      const passwordHash = 'testHash123';
      const salt = 'testSalt123';
      const iterations = 10000;
      const keyLength = 64;
      const digest = 'sha512';
      const sessionSalt = 'sessionSalt123';

      // Mock do crypto.pbkdf2Sync para retornar o mesmo hash
      const originalPbkdf2Sync = require('crypto').pbkdf2Sync;
      require('crypto').pbkdf2Sync = jest.fn().mockReturnValue(Buffer.from(passwordHash));

      const result = CryptoUtils.verifyFrontendPassword(
        passwordHash,
        salt,
        iterations,
        keyLength,
        digest,
        sessionSalt
      );

      expect(result).toBe(true);
      expect(require('crypto').pbkdf2Sync).toHaveBeenCalledWith(
        passwordHash,
        sessionSalt + salt,
        iterations,
        keyLength,
        digest
      );

      // Restaurar função original
      require('crypto').pbkdf2Sync = originalPbkdf2Sync;
    });

    test('deve rejeitar senha criptografada inválida', () => {
      const passwordHash = 'testHash123';
      const salt = 'testSalt123';
      const iterations = 10000;
      const keyLength = 64;
      const digest = 'sha512';
      const sessionSalt = 'sessionSalt123';

      // Mock do crypto.pbkdf2Sync para retornar hash diferente
      const originalPbkdf2Sync = require('crypto').pbkdf2Sync;
      require('crypto').pbkdf2Sync = jest.fn().mockReturnValue(Buffer.from('differentHash'));

      const result = CryptoUtils.verifyFrontendPassword(
        passwordHash,
        salt,
        iterations,
        keyLength,
        digest,
        sessionSalt
      );

      expect(result).toBe(false);

      // Restaurar função original
      require('crypto').pbkdf2Sync = originalPbkdf2Sync;
    });

    test('deve lidar com erro na verificação', () => {
      const passwordHash = 'testHash123';
      const salt = 'testSalt123';
      const iterations = 10000;
      const keyLength = 64;
      const digest = 'sha512';
      const sessionSalt = 'sessionSalt123';

      // Mock do crypto.pbkdf2Sync para lançar erro
      const originalPbkdf2Sync = require('crypto').pbkdf2Sync;
      require('crypto').pbkdf2Sync = jest.fn().mockImplementation(() => {
        throw new Error('Crypto error');
      });

      const result = CryptoUtils.verifyFrontendPassword(
        passwordHash,
        salt,
        iterations,
        keyLength,
        digest,
        sessionSalt
      );

      expect(result).toBe(false);

      // Restaurar função original
      require('crypto').pbkdf2Sync = originalPbkdf2Sync;
    });
  });

  describe('hashForStorage', () => {
    test('deve gerar hash BCrypt para armazenamento', async () => {
      const password = 'TestPassword123!';
      const result = await CryptoUtils.hashForStorage(password);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(20);
    });

    test('deve usar rounds personalizados', async () => {
      const password = 'TestPassword123!';
      const customRounds = 10;
      const result = await CryptoUtils.hashForStorage(password, customRounds);

      expect(result).toBeTruthy();
    });
  });

  describe('verifyStoredPassword', () => {
    test('deve verificar senha BCrypt armazenada corretamente', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await CryptoUtils.hashForStorage(password);

      const result = await CryptoUtils.verifyStoredPassword(password, hashedPassword);

      expect(result).toBe(true);
    });

    test('deve rejeitar senha BCrypt incorreta', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await CryptoUtils.hashForStorage(password);

      const result = await CryptoUtils.verifyStoredPassword(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('generateSalt', () => {
    test('deve gerar salt com comprimento padrão', () => {
      const salt = CryptoUtils.generateSalt();

      expect(salt).toBeTruthy();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBe(64); // 32 bytes em hex
    });

    test('deve gerar salt com comprimento personalizado', () => {
      const customLength = 16;
      const salt = CryptoUtils.generateSalt(customLength);

      expect(salt).toBeTruthy();
      expect(salt.length).toBe(32); // 16 bytes em hex
    });
  });

  describe('generateSecurityToken', () => {
    test('deve gerar token de segurança único', () => {
      const token1 = CryptoUtils.generateSecurityToken();
      const token2 = CryptoUtils.generateSecurityToken();

      expect(token1).toBeTruthy();
      expect(token2).toBeTruthy();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes em hex
    });
  });

  describe('encryptData e decryptData', () => {
    test('deve criptografar e descriptografar dados corretamente', () => {
      const testData = { userId: 123, email: 'test@example.com' };
      const key = 'testKey123';

      const encrypted = CryptoUtils.encryptData(testData, key);
      const decrypted = CryptoUtils.decryptData(encrypted, key);

      expect(encrypted).toBeTruthy();
      expect(decrypted).toEqual(testData);
    });

    test('deve lidar com dados vazios', () => {
      const testData = {};
      const key = 'testKey123';

      const encrypted = CryptoUtils.encryptData(testData, key);
      const decrypted = CryptoUtils.decryptData(encrypted, key);

      expect(decrypted).toEqual(testData);
    });

    test('deve lidar com erro na criptografia', () => {
      const testData = { userId: 123 };
      const key = 'testKey123';

      // Mock do createCipher para lançar erro
      const originalCreateCipher = require('crypto').createCipher;
      require('crypto').createCipher = jest.fn().mockImplementation(() => {
        throw new Error('Crypto error');
      });

      expect(() => CryptoUtils.encryptData(testData, key)).toThrow('Falha na criptografia dos dados');

      // Restaurar função original
      require('crypto').createCipher = originalCreateCipher;
    });

    test('deve lidar com erro na descriptografia', () => {
      const encryptedData = 'invalidEncryptedData';
      const key = 'testKey123';

      // Mock do createDecipher para lançar erro
      const originalCreateDecipher = require('crypto').createDecipher;
      require('crypto').createDecipher = jest.fn().mockImplementation(() => {
        throw new Error('Crypto error');
      });

      expect(() => CryptoUtils.decryptData(encryptedData, key)).toThrow('Falha na descriptografia dos dados');

      // Restaurar função original
      require('crypto').createDecipher = originalCreateDecipher;
    });
  });
});

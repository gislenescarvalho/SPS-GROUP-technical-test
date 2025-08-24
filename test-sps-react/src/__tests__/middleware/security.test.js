import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  secureStorage,
  logSecurityEvent,
  securityMiddleware
} from '../../middleware/security';

describe('Security Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sanitizeInput', () => {
    test('deve sanitizar string com caracteres especiais', () => {
      const input = '<script>alert("xss")</script>Hello World!';
      const result = sanitizeInput(input);

      expect(result).toBe('Hello World!');
    });

    test('deve remover tags HTML', () => {
      const input = '<p>Texto</p><div>Conteúdo</div>';
      const result = sanitizeInput(input);

      expect(result).toBe('TextoConteúdo');
    });

    test('deve manter texto normal sem alterações', () => {
      const input = 'Texto normal sem tags';
      const result = sanitizeInput(input);

      expect(result).toBe(input);
    });

    test('deve lidar com string vazia', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    test('deve lidar com null/undefined', () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('validateEmail', () => {
    test('deve validar email correto', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('deve rejeitar email inválido', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('deve validar senha forte', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
    });

    test('deve rejeitar senha fraca', () => {
      expect(validatePassword('123')).toBe(false);
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('secureStorage', () => {
    beforeEach(() => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      global.localStorage = localStorageMock;
    });

    test('deve armazenar e recuperar dados', () => {
      const key = 'test-key';
      const value = 'test-value';

      secureStorage.setItem(key, value);
      expect(localStorage.setItem).toHaveBeenCalledWith(key, value);

      localStorage.getItem.mockReturnValue(value);
      const retrieved = secureStorage.getItem(key);
      expect(retrieved).toBe(value);
    });

    test('deve remover dados', () => {
      const key = 'test-key';

      secureStorage.removeItem(key);
      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
    });

    test('deve retornar null para chave inexistente', () => {
      localStorage.getItem.mockReturnValue(null);
      const result = secureStorage.getItem('inexistent-key');
      expect(result).toBeNull();
    });
  });

  describe('logSecurityEvent', () => {
    test('deve registrar evento de segurança', () => {
      const eventType = 'login_attempt';
      const details = { ip: '192.168.1.1' };

      logSecurityEvent(eventType, details);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🔒 Security Event:'),
        expect.objectContaining({
          event: eventType,
          details: details,
          timestamp: expect.any(String)
        })
      );
    });

    test('deve registrar evento sem detalhes', () => {
      const eventType = 'logout';

      logSecurityEvent(eventType);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🔒 Security Event:'),
        expect.objectContaining({
          event: eventType,
          details: {},
          timestamp: expect.any(String)
        })
      );
    });
  });

  describe('securityMiddleware', () => {
    describe('beforeRequest', () => {
      test('deve sanitizar dados da requisição', () => {
        const config = {
          data: {
            name: '<script>alert(1)</script>test',
            email: 'test@example.com'
          }
        };

        const result = securityMiddleware.beforeRequest(config);

        expect(result.data.name).toBe('test');
        expect(result.data.email).toBe('test@example.com');
      });

      test('deve lidar com requisição sem dados', () => {
        const config = {};

        const result = securityMiddleware.beforeRequest(config);

        expect(result).toEqual(config);
      });
    });

    describe('afterResponse', () => {
      test('deve validar headers de segurança', () => {
        const response = {
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
          }
        };

        securityMiddleware.afterResponse(response);

        expect(console.warn).not.toHaveBeenCalled();
      });

      test('deve logar erro de API', () => {
        const response = {
          status: 500,
          data: { error: 'Internal Server Error' }
        };

        securityMiddleware.afterResponse(response);

        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('API Error:'),
          expect.objectContaining({
            status: 500,
            data: { error: 'Internal Server Error' }
          })
        );
      });
    });
  });
});

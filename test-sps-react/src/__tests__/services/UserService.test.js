import UserService from '../../services/UserService';
import UserRepository from '../../repositories/UserRepository';

// Mock do repositório
jest.mock('../../repositories/UserRepository');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    test('deve listar usuários com sucesso', async () => {
      const mockUsers = {
        users: [
          { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' },
          { id: 2, name: 'User', email: 'user@test.com', type: 'user' }
        ],
        pagination: { page: 1, limit: 10, total: 2 }
      };

      UserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await UserService.list({ page: 1, limit: 10 });

      expect(UserRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(mockUsers);
    });

    test('deve propagar erro do repositório', async () => {
      const error = new Error('Erro ao listar usuários');
      UserRepository.findAll.mockRejectedValue(error);

      await expect(UserService.list()).rejects.toThrow('Erro ao listar usuários');
    });
  });

  describe('get', () => {
    test('deve buscar usuário por ID com sucesso', async () => {
      const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      UserRepository.findById.mockResolvedValue(mockUser);

      const result = await UserService.get(1);

      expect(UserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    test('deve propagar erro do repositório', async () => {
      const error = new Error('Usuário não encontrado');
      UserRepository.findById.mockRejectedValue(error);

      await expect(UserService.get(999)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('create', () => {
    test('deve criar usuário com dados válidos', async () => {
      const userData = {
        name: 'Novo Usuário',
        email: 'novo@test.com',
        type: 'user',
        password: '123456'
      };

      const mockUser = { id: 3, ...userData };
      UserRepository.create.mockResolvedValue(mockUser);

      const result = await UserService.create(userData);

      expect(UserRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });

    test('deve validar dados obrigatórios', async () => {
      const invalidData = { name: 'Teste' }; // Faltando email, type e password

      await expect(UserService.create(invalidData)).rejects.toThrow();
    });

    test('deve validar email único', async () => {
      const userData = {
        name: 'Teste',
        email: 'existente@test.com',
        type: 'user',
        password: '123456'
      };

      UserRepository.checkEmailExists.mockResolvedValue(true);

      await expect(UserService.create(userData)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('update', () => {
    test('deve atualizar usuário com dados válidos', async () => {
      const userData = {
        name: 'Usuário Atualizado',
        email: 'atualizado@test.com',
        type: 'admin'
      };

      const existingUser = { id: 1, name: 'Antigo', email: 'antigo@test.com', type: 'user' };
      const updatedUser = { id: 1, ...userData };

      UserRepository.findById.mockResolvedValue(existingUser);
      UserRepository.update.mockResolvedValue(updatedUser);

      const result = await UserService.update(1, userData);

      expect(UserRepository.findById).toHaveBeenCalledWith(1);
      expect(UserRepository.update).toHaveBeenCalledWith(1, userData);
      expect(result).toEqual(updatedUser);
    });

    test('deve validar se usuário existe', async () => {
      UserRepository.findById.mockResolvedValue(null);

      await expect(UserService.update(999, { name: 'Teste' })).rejects.toThrow('Usuário não encontrado');
    });

    test('deve validar email único na atualização', async () => {
      const userData = { email: 'outro@test.com' };
      const existingUser = { id: 1, name: 'Teste', email: 'teste@test.com', type: 'user' };

      UserRepository.findById.mockResolvedValue(existingUser);
      UserRepository.checkEmailExists.mockResolvedValue(true);

      await expect(UserService.update(1, userData)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('delete', () => {
    test('deve deletar usuário com sucesso', async () => {
      const existingUser = { id: 1, name: 'Teste', email: 'teste@test.com', type: 'user' };
      
      UserRepository.findById.mockResolvedValue(existingUser);
      UserRepository.delete.mockResolvedValue(true);

      const result = await UserService.delete(1);

      expect(UserRepository.findById).toHaveBeenCalledWith(1);
      expect(UserRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    test('deve validar se usuário existe antes de deletar', async () => {
      UserRepository.findById.mockResolvedValue(null);

      await expect(UserService.delete(999)).rejects.toThrow('Usuário não encontrado');
    });

    test('deve impedir deletar último admin', async () => {
      const adminUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      
      UserRepository.findById.mockResolvedValue(adminUser);
      
      // Mock para contar apenas 1 admin
      UserService.getAdminCount = jest.fn().mockResolvedValue(1);

      await expect(UserService.delete(1)).rejects.toThrow('Não é possível deletar o último administrador');
    });
  });

  describe('checkEmailExists', () => {
    test('deve verificar se email existe', async () => {
      UserRepository.checkEmailExists.mockResolvedValue(true);

      const result = await UserService.checkEmailExists('teste@test.com');

      expect(UserRepository.checkEmailExists).toHaveBeenCalledWith('teste@test.com', null);
      expect(result).toBe(true);
    });

    test('deve verificar email excluindo usuário específico', async () => {
      UserRepository.checkEmailExists.mockResolvedValue(false);

      const result = await UserService.checkEmailExists('teste@test.com', 1);

      expect(UserRepository.checkEmailExists).toHaveBeenCalledWith('teste@test.com', 1);
      expect(result).toBe(false);
    });
  });

  describe('findByCriteria', () => {
    test('deve buscar usuários por critérios', async () => {
      const criteria = { type: 'admin' };
      const mockUsers = [{ id: 1, name: 'Admin', type: 'admin' }];

      UserRepository.findByCriteria.mockResolvedValue(mockUsers);

      const result = await UserService.findByCriteria(criteria);

      expect(UserRepository.findByCriteria).toHaveBeenCalledWith(criteria);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('count', () => {
    test('deve contar total de usuários', async () => {
      UserRepository.count.mockResolvedValue(10);

      const result = await UserService.count();

      expect(UserRepository.count).toHaveBeenCalled();
      expect(result).toBe(10);
    });
  });

  describe('getAdminCount', () => {
    test('deve contar administradores', async () => {
      const admins = [
        { id: 1, type: 'admin' },
        { id: 2, type: 'admin' }
      ];

      UserRepository.findByCriteria.mockResolvedValue(admins);

      const result = await UserService.getAdminCount();

      expect(UserRepository.findByCriteria).toHaveBeenCalledWith({ type: 'admin' });
      expect(result).toBe(2);
    });
  });

  describe('validateUserData', () => {
    test('deve validar dados válidos', async () => {
      const validData = {
        name: 'Teste',
        email: 'teste@test.com',
        type: 'user',
        password: '123456'
      };

      UserRepository.checkEmailExists.mockResolvedValue(false);

      const result = await UserService.validateUserData(validData, false);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('deve detectar nome muito curto', async () => {
      const invalidData = {
        name: 'A',
        email: 'teste@test.com',
        type: 'user',
        password: '123456'
      };

      const result = await UserService.validateUserData(invalidData, false);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Nome deve ter pelo menos 2 caracteres');
    });

    test('deve detectar email inválido', async () => {
      const invalidData = {
        name: 'Teste',
        email: 'email-invalido',
        type: 'user',
        password: '123456'
      };

      const result = await UserService.validateUserData(invalidData, false);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email deve ter um formato válido');
    });

    test('deve detectar tipo inválido', async () => {
      const invalidData = {
        name: 'Teste',
        email: 'teste@test.com',
        type: 'invalid',
        password: '123456'
      };

      const result = await UserService.validateUserData(invalidData, false);

      expect(result.isValid).toBe(false);
      expect(result.errors.type).toBe('Tipo deve ser "user" ou "admin"');
    });

    test('deve detectar senha muito curta', async () => {
      const invalidData = {
        name: 'Teste',
        email: 'teste@test.com',
        type: 'user',
        password: '123'
      };

      const result = await UserService.validateUserData(invalidData, false);

      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Senha deve ter pelo menos 4 caracteres');
    });

    test('deve detectar email duplicado', async () => {
      const data = {
        name: 'Teste',
        email: 'existente@test.com',
        type: 'user',
        password: '123456'
      };

      UserRepository.checkEmailExists.mockResolvedValue(true);

      const result = await UserService.validateUserData(data, false);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Este email já está em uso por outro usuário');
    });
  });

  describe('isValidEmail', () => {
    test('deve validar emails corretos', () => {
      expect(UserService.isValidEmail('teste@test.com')).toBe(true);
      expect(UserService.isValidEmail('admin@spsgroup.com.br')).toBe(true);
      expect(UserService.isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('deve rejeitar emails incorretos', () => {
      expect(UserService.isValidEmail('email-invalido')).toBe(false);
      expect(UserService.isValidEmail('teste@')).toBe(false);
      expect(UserService.isValidEmail('@test.com')).toBe(false);
      expect(UserService.isValidEmail('')).toBe(false);
      expect(UserService.isValidEmail(null)).toBe(false);
    });
  });
});


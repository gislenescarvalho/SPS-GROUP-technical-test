import UserRepository from '../../repositories/UserRepository';
import api from '../../services/httpInterceptor';
import config from '../../config/api';

// Mock das dependências
jest.mock('../../services/httpInterceptor');
jest.mock('../../config/api');

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock da configuração
    config.baseURL = 'http://localhost:3001';
    config.pagination = {
      defaultPage: 1,
      defaultLimit: 10
    };
    config.endpoints = {
      users: {
        list: '/users',
        create: '/users',
        get: (id) => `/users/${id}`,
        update: (id) => `/users/${id}`,
        delete: (id) => `/users/${id}`
      }
    };
  });

  describe('findAll', () => {
    test('deve listar usuários com parâmetros padrão', async () => {
      const mockResponse = {
        data: {
          users: [
            { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' },
            { id: 2, name: 'User', email: 'user@test.com', type: 'user' }
          ],
          pagination: { page: 1, limit: 10, total: 2 }
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await UserRepository.findAll();

      expect(api.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockResponse.data);
    });

    test('deve listar usuários com parâmetros customizados', async () => {
      const params = { page: 2, limit: 5, search: 'admin' };
      const mockResponse = {
        data: {
          users: [{ id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' }],
          pagination: { page: 2, limit: 5, total: 1 }
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await UserRepository.findAll(params);

      expect(api.get).toHaveBeenCalledWith('/users?page=2&limit=5&search=admin');
      expect(result).toEqual(mockResponse.data);
    });

    test('deve lidar com erro na requisição', async () => {
      const error = new Error('Erro na requisição');
      api.get.mockRejectedValue(error);

      await expect(UserRepository.findAll()).rejects.toThrow('Erro na requisição');
    });
  });

  describe('findById', () => {
    test('deve buscar usuário por ID', async () => {
      const userId = 1;
      const mockResponse = {
        data: { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await UserRepository.findById(userId);

      expect(api.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockResponse.data);
    });

    test('deve lidar com erro na busca por ID', async () => {
      const userId = 999;
      const error = new Error('Usuário não encontrado');
      api.get.mockRejectedValue(error);

      await expect(UserRepository.findById(userId)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('create', () => {
    test('deve criar usuário com sucesso', async () => {
      const userData = {
        name: 'Novo Usuário',
        email: 'novo@test.com',
        type: 'user',
        password: '123456'
      };

      const mockResponse = {
        data: { id: 3, ...userData }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await UserRepository.create(userData);

      expect(api.post).toHaveBeenCalledWith('/users', userData);
      expect(result).toEqual(mockResponse.data);
    });

    test('deve lidar com erro na criação', async () => {
      const userData = { name: 'Teste' };
      const error = new Error('Dados inválidos');
      api.post.mockRejectedValue(error);

      await expect(UserRepository.create(userData)).rejects.toThrow('Dados inválidos');
    });
  });

  describe('update', () => {
    test('deve atualizar usuário com sucesso', async () => {
      const userId = 1;
      const userData = {
        name: 'Usuário Atualizado',
        email: 'atualizado@test.com',
        type: 'admin'
      };

      const mockResponse = {
        data: { id: userId, ...userData }
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await UserRepository.update(userId, userData);

      expect(api.put).toHaveBeenCalledWith('/users/1', userData);
      expect(result).toEqual(mockResponse.data);
    });

    test('deve lidar com erro na atualização', async () => {
      const userId = 999;
      const userData = { name: 'Teste' };
      const error = new Error('Usuário não encontrado');
      api.put.mockRejectedValue(error);

      await expect(UserRepository.update(userId, userData)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('delete', () => {
    test('deve deletar usuário com sucesso', async () => {
      const userId = 1;

      api.delete.mockResolvedValue({});

      const result = await UserRepository.delete(userId);

      expect(api.delete).toHaveBeenCalledWith('/users/1');
      expect(result).toBe(true);
    });

    test('deve lidar com erro na deleção', async () => {
      const userId = 999;
      const error = new Error('Usuário não encontrado');
      api.delete.mockRejectedValue(error);

      await expect(UserRepository.delete(userId)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('checkEmailExists', () => {
    test('deve verificar se email existe', async () => {
      const email = 'existente@test.com';
      const excludeUserId = null;

      const mockUsers = [
        { id: 1, email: 'existente@test.com' },
        { id: 2, email: 'outro@test.com' }
      ];

      // Mock do método findAll
      UserRepository.findAll = jest.fn().mockResolvedValue(mockUsers);

      const result = await UserRepository.checkEmailExists(email, excludeUserId);

      expect(UserRepository.findAll).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('deve verificar email excluindo usuário específico', async () => {
      const email = 'teste@test.com';
      const excludeUserId = 1;

      const mockUsers = [
        { id: 1, email: 'teste@test.com' },
        { id: 2, email: 'outro@test.com' }
      ];

      UserRepository.findAll = jest.fn().mockResolvedValue(mockUsers);

      const result = await UserRepository.checkEmailExists(email, excludeUserId);

      expect(result).toBe(false); // Não deve encontrar porque exclui o ID 1
    });

    test('deve retornar false quando há erro', async () => {
      const email = 'teste@test.com';
      const error = new Error('Erro na busca');

      UserRepository.findAll = jest.fn().mockRejectedValue(error);

      const result = await UserRepository.checkEmailExists(email);

      expect(result).toBe(false);
    });
  });

  describe('findByCriteria', () => {
    test('deve buscar usuários por critérios', async () => {
      const criteria = { name: 'Admin', type: 'admin' };
      const mockResponse = {
        data: [{ id: 1, name: 'Admin', type: 'admin' }]
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await UserRepository.findByCriteria(criteria);

      expect(api.get).toHaveBeenCalledWith('/users?name=Admin&type=admin');
      expect(result).toEqual(mockResponse.data);
    });

    test('deve buscar com critérios parciais', async () => {
      const criteria = { type: 'user' };
      const mockResponse = {
        data: [{ id: 2, name: 'User', type: 'user' }]
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await UserRepository.findByCriteria(criteria);

      expect(api.get).toHaveBeenCalledWith('/users?type=user');
      expect(result).toEqual(mockResponse.data);
    });

    test('deve lidar com critérios vazios', async () => {
      const criteria = {};
      const mockResponse = {
        data: []
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await UserRepository.findByCriteria(criteria);

      expect(api.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('count', () => {
    test('deve contar total de usuários', async () => {
      const mockResponse = {
        data: {
          users: [],
          pagination: { total: 10 }
        }
      };

      UserRepository.findAll = jest.fn().mockResolvedValue(mockResponse.data);

      const result = await UserRepository.count();

      expect(UserRepository.findAll).toHaveBeenCalledWith({ limit: 1 });
      expect(result).toBe(10);
    });

    test('deve retornar 0 quando há erro', async () => {
      const error = new Error('Erro na contagem');

      UserRepository.findAll = jest.fn().mockRejectedValue(error);

      const result = await UserRepository.count();

      expect(result).toBe(0);
    });
  });
});


import UserRepository from '../../repositories/UserRepository';
import api from '../../services/httpInterceptor';
import config from '../../config/api';

jest.mock('../../services/httpInterceptor');
jest.mock('../../config/api');

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    config.baseURL = 'http://localhost:3001';
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
    test('deve listar usuários com sucesso', async () => {
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

      expect(api.get).toHaveBeenCalledWith('/users?page=1&limit=10');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('findById', () => {
    test('deve buscar usuário por ID', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' }
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await UserRepository.findById(1);

      expect(api.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockResponse.data);
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
  });

  describe('update', () => {
    test('deve atualizar usuário com sucesso', async () => {
      const userData = { name: 'Usuário Atualizado' };
      const mockResponse = {
        data: { id: 1, ...userData }
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await UserRepository.update(1, userData);

      expect(api.put).toHaveBeenCalledWith('/users/1', userData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    test('deve deletar usuário com sucesso', async () => {
      api.delete.mockResolvedValue({ data: true });

      const result = await UserRepository.delete(1);

      expect(api.delete).toHaveBeenCalledWith('/users/1');
      expect(result).toBe(true);
    });
  });
});


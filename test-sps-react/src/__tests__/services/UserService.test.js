import UserService from '../../services/UserService';
import UserRepository from '../../repositories/UserRepository';

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
  });

  describe('get', () => {
    test('deve buscar usuário por ID com sucesso', async () => {
      const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      UserRepository.findById.mockResolvedValue(mockUser);

      const result = await UserService.get(1);

      expect(UserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
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
  });

  describe('update', () => {
    test('deve atualizar usuário com dados válidos', async () => {
      const userData = { 
        name: 'Usuário Atualizado',
        email: 'usuario@test.com',
        type: 'user'
      };
      const updatedUser = { id: 1, ...userData };

      UserRepository.findById.mockResolvedValue({ id: 1, name: 'Antigo', email: 'antigo@test.com', type: 'user' });
      UserRepository.update.mockResolvedValue(updatedUser);

      const result = await UserService.update(1, userData);

      expect(UserRepository.update).toHaveBeenCalledWith(1, userData);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    test('deve deletar usuário com sucesso', async () => {
      UserRepository.findById.mockResolvedValue({ id: 1, name: 'Teste' });
      UserRepository.delete.mockResolvedValue(true);

      const result = await UserService.delete(1);

      expect(UserRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });
  });
});


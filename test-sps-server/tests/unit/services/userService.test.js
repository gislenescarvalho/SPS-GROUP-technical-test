const userService = require('../../../src/services/userService');
const database = require('../../../src/database/fakeDatabase');

// Mock do banco de dados
jest.mock('../../../src/database/fakeDatabase');

describe('UserService', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('deve retornar todos os usuários', async () => {
      const mockUsers = [
        { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' },
        { id: 2, name: 'User', email: 'user@test.com', type: 'user' }
      ];
      
      database.getAllUsers.mockReturnValue(mockUsers);
      
      const result = await userService.getAllUsers();
      
      expect(database.getAllUsers).toHaveBeenCalled();
      expect(result.users).toEqual(mockUsers);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getUserById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      database.getUserById.mockReturnValue(mockUser);
      
      const result = await userService.getUserById(1);
      
      expect(database.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('deve lançar erro quando usuário não encontrado', async () => {
      database.getUserById.mockReturnValue(null);
      
      await expect(userService.getUserById(999)).rejects.toThrow('Usuário não encontrado');
      expect(database.getUserById).toHaveBeenCalledWith(999);
    });
  });

  describe('createUser', () => {
    it('deve criar usuário com dados válidos', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };
      
      const mockCreatedUser = { id: 3, ...userData };
      database.emailExists.mockReturnValue(false);
      database.createUser.mockResolvedValue(mockCreatedUser);
      
      const result = await userService.createUser(userData);
      
      expect(database.emailExists).toHaveBeenCalledWith('test@test.com');
      expect(database.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockCreatedUser);
    });

    it('deve lançar erro quando campos obrigatórios estão faltando', async () => {
      const userData = { name: 'Test User', email: 'test@test.com' };
      
      await expect(userService.createUser(userData)).rejects.toThrow('Todos os campos são obrigatórios: name, email, type, password');
    });

    it('deve lançar erro quando tipo de usuário é inválido', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'invalid',
        password: 'Test123!@#'
      };
      
      await expect(userService.createUser(userData)).rejects.toThrow('Tipo de usuário deve ser "admin" ou "user"');
    });

    it('deve lançar erro quando email já existe', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@test.com',
        type: 'user',
        password: 'Test123!@#'
      };
      
      database.emailExists.mockReturnValue(true);
      
      await expect(userService.createUser(userData)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('updateUser', () => {
    it('deve atualizar usuário com dados válidos', async () => {
      const existingUser = { id: 1, name: 'Old Name', email: 'old@test.com', type: 'user' };
      const updateData = { name: 'New Name' };
      const updatedUser = { ...existingUser, ...updateData };
      
      database.getUserById.mockReturnValue(existingUser);
      database.emailExists.mockReturnValue(false);
      database.updateUser.mockResolvedValue(updatedUser);
      
      const result = await userService.updateUser(1, updateData);
      
      expect(database.getUserById).toHaveBeenCalledWith(1);
      expect(database.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('deve lançar erro quando usuário não existe', async () => {
      database.getUserById.mockReturnValue(null);
      
      await expect(userService.updateUser(999, { name: 'New Name' })).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro quando tipo de usuário é inválido', async () => {
      const existingUser = { id: 1, name: 'Test', email: 'test@test.com', type: 'user' };
      database.getUserById.mockReturnValue(existingUser);
      
      await expect(userService.updateUser(1, { type: 'invalid' })).rejects.toThrow('Tipo de usuário deve ser "admin" ou "user"');
    });
  });

  describe('deleteUser', () => {
    it('deve deletar usuário válido', async () => {
      const existingUser = { id: 1, name: 'Test', email: 'test@test.com', type: 'user' };
      database.getUserById.mockReturnValue(existingUser);
      database.deleteUser.mockReturnValue(true);
      
      const result = await userService.deleteUser(1);
      
      expect(database.getUserById).toHaveBeenCalledWith(1);
      expect(database.deleteUser).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('deve lançar erro quando usuário não existe', async () => {
      database.getUserById.mockReturnValue(null);
      
      await expect(userService.deleteUser(999)).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro ao tentar deletar admin principal', async () => {
      const adminUser = { id: 1, name: 'admin', email: 'admin@spsgroup.com.br', type: 'admin' };
      database.getUserById.mockReturnValue(adminUser);
      
      await expect(userService.deleteUser(1)).rejects.toThrow('Não é possível deletar o usuário admin principal');
    });
  });
});

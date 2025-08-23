const userService = require('../../../src/services/userService');
const database = require('../../../src/database/fakeDatabase');

// Mock do banco de dados
jest.mock('../../../src/database/fakeDatabase');

describe('Email Unique Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Criação de Usuário', () => {
    it('deve permitir criação com email único', async () => {
      const userData = {
        name: 'Test User',
        email: 'unique@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      database.emailExists.mockReturnValue(false);
      database.createUser.mockResolvedValue({ id: 2, ...userData });

      const result = await userService.createUser(userData);

      expect(database.emailExists).toHaveBeenCalledWith('unique@test.com');
      expect(database.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual({ id: 2, ...userData });
    });

    it('deve rejeitar criação com email duplicado', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      database.emailExists.mockReturnValue(true);

      await expect(userService.createUser(userData)).rejects.toThrow('Email já cadastrado');
      expect(database.emailExists).toHaveBeenCalledWith('existing@test.com');
      expect(database.createUser).not.toHaveBeenCalled();
    });

    it('deve verificar email único antes de criar', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      database.emailExists.mockReturnValue(false);
      database.createUser.mockResolvedValue({ id: 2, ...userData });

      await userService.createUser(userData);

      expect(database.emailExists).toHaveBeenCalledWith('test@test.com');
      expect(database.createUser).toHaveBeenCalledWith(userData);
    });
  });

  describe('Atualização de Usuário', () => {
    it('deve permitir atualização sem mudança de email', async () => {
      const existingUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      const updateData = { name: 'Updated Name' };

      database.getUserById.mockReturnValue(existingUser);
      database.updateUser.mockResolvedValue({ ...existingUser, ...updateData });

      const result = await userService.updateUser(1, updateData);

      expect(database.emailExists).not.toHaveBeenCalled();
      expect(database.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(result.name).toBe('Updated Name');
    });

    it('deve permitir atualização para email único', async () => {
      const existingUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      const updateData = { email: 'newemail@test.com' };

      database.getUserById.mockReturnValue(existingUser);
      database.emailExists.mockReturnValue(false);
      database.updateUser.mockResolvedValue({ ...existingUser, ...updateData });

      const result = await userService.updateUser(1, updateData);

      expect(database.emailExists).toHaveBeenCalledWith('newemail@test.com', 1);
      expect(database.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(result.email).toBe('newemail@test.com');
    });

    it('deve rejeitar atualização para email duplicado', async () => {
      const existingUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      const updateData = { email: 'existing@test.com' };

      database.getUserById.mockReturnValue(existingUser);
      database.emailExists.mockReturnValue(true);

      await expect(userService.updateUser(1, updateData)).rejects.toThrow('Email já cadastrado');
      expect(database.emailExists).toHaveBeenCalledWith('existing@test.com', 1);
      expect(database.updateUser).not.toHaveBeenCalled();
    });

    it('deve permitir atualização do próprio email', async () => {
      const existingUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      const updateData = { email: 'admin@test.com' }; // Mesmo email

      database.getUserById.mockReturnValue(existingUser);
      database.emailExists.mockReturnValue(false); // Não deve ser chamado
      database.updateUser.mockResolvedValue({ ...existingUser, ...updateData });

      const result = await userService.updateUser(1, updateData);

      expect(database.emailExists).toHaveBeenCalledWith('admin@test.com', 1);
      expect(database.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(result.email).toBe('admin@test.com');
    });

    it('deve excluir o próprio usuário da verificação de email único', async () => {
      const existingUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      const updateData = { email: 'newemail@test.com' };

      database.getUserById.mockReturnValue(existingUser);
      database.emailExists.mockReturnValue(false);
      database.updateUser.mockResolvedValue({ ...existingUser, ...updateData });

      await userService.updateUser(1, updateData);

      expect(database.emailExists).toHaveBeenCalledWith('newemail@test.com', 1);
    });
  });

  describe('Cenários de Borda', () => {
    it('deve tratar email case-insensitive', async () => {
      const userData = {
        name: 'Test User',
        email: 'TEST@TEST.COM',
        type: 'user',
        password: 'Test123!@#'
      };

      database.emailExists.mockReturnValue(false);
      database.createUser.mockResolvedValue({ id: 2, ...userData });

      await userService.createUser(userData);

      expect(database.emailExists).toHaveBeenCalledWith('TEST@TEST.COM');
    });

    it('deve rejeitar email vazio', async () => {
      const userData = {
        name: 'Test User',
        email: '',
        type: 'user',
        password: 'Test123!@#'
      };

      await expect(userService.createUser(userData)).rejects.toThrow('Todos os campos são obrigatórios: name, email, type, password');
    });

    it('deve rejeitar email null', async () => {
      const userData = {
        name: 'Test User',
        email: null,
        type: 'user',
        password: 'Test123!@#'
      };

      await expect(userService.createUser(userData)).rejects.toThrow('Todos os campos são obrigatórios: name, email, type, password');
    });

    it('deve rejeitar email undefined', async () => {
      const userData = {
        name: 'Test User',
        type: 'user',
        password: 'Test123!@#'
      };

      await expect(userService.createUser(userData)).rejects.toThrow('Todos os campos são obrigatórios: name, email, type, password');
    });
  });

  describe('Performance e Chamadas de Banco', () => {
    it('deve fazer apenas uma chamada para verificar email único na criação', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      database.emailExists.mockReturnValue(false);
      database.createUser.mockResolvedValue({ id: 2, ...userData });

      await userService.createUser(userData);

      expect(database.emailExists).toHaveBeenCalledTimes(1);
    });

    it('deve fazer apenas uma chamada para verificar email único na atualização', async () => {
      const existingUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      const updateData = { email: 'newemail@test.com' };

      database.getUserById.mockReturnValue(existingUser);
      database.emailExists.mockReturnValue(false);
      database.updateUser.mockResolvedValue({ ...existingUser, ...updateData });

      await userService.updateUser(1, updateData);

      expect(database.emailExists).toHaveBeenCalledTimes(1);
    });

    it('deve não verificar email único quando email não é atualizado', async () => {
      const existingUser = { id: 1, name: 'Admin', email: 'admin@test.com', type: 'admin' };
      const updateData = { name: 'Updated Name' };

      database.getUserById.mockReturnValue(existingUser);
      database.updateUser.mockResolvedValue({ ...existingUser, ...updateData });

      await userService.updateUser(1, updateData);

      expect(database.emailExists).not.toHaveBeenCalled();
    });
  });

  describe('Integração com Database', () => {
    it('deve usar o método correto do database para verificar email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      database.emailExists.mockReturnValue(false);
      database.createUser.mockResolvedValue({ id: 2, ...userData });

      await userService.createUser(userData);

      expect(database.emailExists).toHaveBeenCalledWith('test@test.com');
    });

    it('deve passar o ID correto para exclusão na atualização', async () => {
      const existingUser = { id: 5, name: 'User', email: 'user@test.com', type: 'user' };
      const updateData = { email: 'newemail@test.com' };

      database.getUserById.mockReturnValue(existingUser);
      database.emailExists.mockReturnValue(false);
      database.updateUser.mockResolvedValue({ ...existingUser, ...updateData });

      await userService.updateUser(5, updateData);

      expect(database.emailExists).toHaveBeenCalledWith('newemail@test.com', 5);
    });
  });
});

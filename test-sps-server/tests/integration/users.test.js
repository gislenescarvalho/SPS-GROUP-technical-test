const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const userRoutes = require('../../src/routes/users');
const userService = require('../../src/services/userService');
const { authenticateToken } = require('../../src/middleware/auth');
const errorHandler = require('../../src/middleware/errorHandler');

// Mock das dependências
jest.mock('../../src/services/userService');
jest.mock('../../src/middleware/auth');

const app = express();
app.use(express.json());
app.use('/users', userRoutes);
app.use(errorHandler);

describe('Users CRUD Integration Tests', () => {
  let validToken;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do middleware de autenticação para passar
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { id: 1, email: 'admin@spsgroup.com.br', type: 'admin' };
      next();
    });

    // Token válido para testes
    validToken = jwt.sign(
      { id: 1, email: 'admin@spsgroup.com.br', type: 'admin' },
      'sps-secret-key',
      { expiresIn: '1h' }
    );
  });

  describe('GET /users - Listar Usuários', () => {
    it('deve listar todos os usuários (cenário feliz)', async () => {
      const mockUsers = [
        { id: 1, name: 'Admin', email: 'admin@spsgroup.com.br', type: 'admin' },
        { id: 2, name: 'User', email: 'user@test.com', type: 'user' }
      ];
      
      userService.getAllUsers.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).not.toHaveProperty('password');
    });

    it('deve retornar lista vazia quando não há usuários', async () => {
      userService.getAllUsers.mockResolvedValue([]);

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
      expect(response.body).toHaveLength(0);
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({ 
          error: 'Token de acesso necessário',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      });

      const response = await request(app)
        .get('/users')
        .expect(401);

      expect(response.body.error).toBe('Token de acesso necessário');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('deve retornar erro 403 quando token é inválido', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        res.status(403).json({ 
          error: 'Token inválido ou expirado',
          timestamp: new Date().toISOString(),
          path: req.path
        });
      });

      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.error).toBe('Token inválido ou expirado');
    });
  });

  describe('GET /users/:id - Buscar Usuário por ID', () => {
    it('deve buscar usuário por ID válido (cenário feliz)', async () => {
      const mockUser = { 
        id: 1, 
        name: 'Admin', 
        email: 'admin@spsgroup.com.br', 
        type: 'admin' 
      };
      
      userService.getUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith('1');
      expect(response.body).not.toHaveProperty('password');
    });

    it('deve retornar erro 404 quando usuário não existe', async () => {
      userService.getUserById.mockRejectedValue(new Error('Usuário não encontrado'));

      const response = await request(app)
        .get('/users/999')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });

    it('deve retornar erro 400 quando ID é inválido', async () => {
      const response = await request(app)
        .get('/users/abc')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);

      expect(response.body.error).toBe('ID deve ser um número');
    });
  });

  describe('POST /users - Criar Usuário', () => {
    it('deve criar usuário com dados válidos (cenário feliz)', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      const mockCreatedUser = { id: 3, ...userData };
      userService.createUser.mockResolvedValue(mockCreatedUser);

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(201);

      expect(response.body).toEqual(mockCreatedUser);
      expect(userService.createUser).toHaveBeenCalledWith(userData, {
        userId: 1,
        userEmail: 'admin@spsgroup.com.br',
        userType: 'admin',
        ipAddress: '::ffff:127.0.0.1'
      });
    });

    it('deve retornar erro 400 quando nome está faltando', async () => {
      const userData = {
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Nome é obrigatório');
    });

    it('deve retornar erro 400 quando email está faltando', async () => {
      const userData = {
        name: 'Test User',
        type: 'user',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Email é obrigatório');
    });

    it('deve retornar erro 400 quando tipo está faltando', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Tipo é obrigatório');
    });

    it('deve retornar erro 400 quando senha está faltando', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Senha é obrigatória');
    });

    it('deve retornar erro 400 quando tipo é inválido', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'invalid',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Tipo deve ser "admin" ou "user"');
    });

    it('deve retornar erro 400 quando email já existe', async () => {
      const userData = {
        name: 'Test User',
        email: 'admin@spsgroup.com.br',
        type: 'user',
        password: 'Test123!@#'
      };

      userService.createUser.mockRejectedValue(new Error('Email já cadastrado'));

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Email já cadastrado');
    });

    it('deve rejeitar email com formato inválido', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        type: 'user',
        password: 'Test123!@#'
      };

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Formato de email inválido');
    });

    it('deve aceitar tipo "admin"', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin2@test.com',
        type: 'admin',
        password: 'Test123!@#'
      };

      const mockCreatedUser = { id: 3, ...userData };
      userService.createUser.mockResolvedValue(mockCreatedUser);

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.type).toBe('admin');
    });

    it('deve aceitar tipo "user"', async () => {
      const userData = {
        name: 'Regular User',
        email: 'user@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      const mockCreatedUser = { id: 3, ...userData };
      userService.createUser.mockResolvedValue(mockCreatedUser);

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.type).toBe('user');
    });
  });

  describe('PUT /users/:id - Atualizar Usuário', () => {
    it('deve atualizar usuário com dados válidos (cenário feliz)', async () => {
      const updateData = { name: 'Updated Name' };
      const mockUpdatedUser = { 
        id: 1, 
        name: 'Updated Name', 
        email: 'admin@spsgroup.com.br', 
        type: 'admin' 
      };
      
      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdatedUser);
      expect(userService.updateUser).toHaveBeenCalledWith('1', updateData, {
        userId: 1,
        userEmail: 'admin@spsgroup.com.br',
        userType: 'admin',
        ipAddress: '::ffff:127.0.0.1'
      });
      expect(response.body.name).toBe('Updated Name');
    });

    it('deve atualizar apenas o nome', async () => {
      const updateData = { name: 'New Name' };
      const mockUpdatedUser = { 
        id: 1, 
        name: 'New Name', 
        email: 'admin@spsgroup.com.br', 
        type: 'admin' 
      };
      
      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('New Name');
    });

    it('deve atualizar apenas o email', async () => {
      const updateData = { email: 'newemail@test.com' };
      const mockUpdatedUser = { 
        id: 1, 
        name: 'Admin', 
        email: 'newemail@test.com', 
        type: 'admin' 
      };
      
      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.email).toBe('newemail@test.com');
    });

    it('deve atualizar apenas o tipo', async () => {
      const updateData = { type: 'user' };
      const mockUpdatedUser = { 
        id: 1, 
        name: 'Admin', 
        email: 'admin@spsgroup.com.br', 
        type: 'user' 
      };
      
      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.type).toBe('user');
    });

    it('deve retornar erro 404 quando usuário não existe', async () => {
      const updateData = { name: 'Updated Name' };
      
      userService.updateUser.mockRejectedValue(new Error('Usuário não encontrado'));

      const response = await request(app)
        .put('/users/999')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });

    it('deve retornar erro 400 quando tipo é inválido', async () => {
      const updateData = { type: 'invalid' };

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Tipo deve ser "admin" ou "user"');
    });

    it('deve retornar erro 400 quando email já existe', async () => {
      const updateData = { email: 'existing@test.com' };
      
      userService.updateUser.mockRejectedValue(new Error('Email já cadastrado'));

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Email já cadastrado');
    });

    it('deve rejeitar atualização com dados vazios', async () => {
      const updateData = {};

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Pelo menos um campo deve ser fornecido para atualização');
    });
  });

  describe('DELETE /users/:id - Deletar Usuário', () => {
    it('deve deletar usuário com sucesso (cenário feliz)', async () => {
      userService.deleteUser.mockResolvedValue(true);

      await request(app)
        .delete('/users/2')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(204);

      expect(userService.deleteUser).toHaveBeenCalledWith('2', {
        userId: 1,
        userEmail: 'admin@spsgroup.com.br',
        userType: 'admin',
        ipAddress: '::ffff:127.0.0.1'
      });
    });

    it('deve retornar erro 404 quando usuário não existe', async () => {
      userService.deleteUser.mockRejectedValue(new Error('Usuário não encontrado'));

      const response = await request(app)
        .delete('/users/999')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });

    it('deve retornar erro 403 quando tenta deletar admin principal', async () => {
      userService.deleteUser.mockRejectedValue(new Error('Não é possível deletar o usuário admin principal'));

      const response = await request(app)
        .delete('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(403);

      expect(response.body.error).toBe('Não é possível deletar o usuário admin principal');
    });

    it('deve retornar erro 400 quando ID é inválido', async () => {
      const response = await request(app)
        .delete('/users/abc')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);

      expect(response.body.error).toBe('ID deve ser um número');
    });
  });

  describe('Validação de Email Único', () => {
    it('deve rejeitar criação com email duplicado', async () => {
      const userData = {
        name: 'Test User',
        email: 'admin@spsgroup.com.br',
        type: 'user',
        password: 'Test123!@#'
      };

      userService.createUser.mockRejectedValue(new Error('Email já cadastrado'));

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Email já cadastrado');
    });

    it('deve rejeitar atualização com email duplicado', async () => {
      const updateData = { 
        email: 'existing@test.com' // Email já existe
      };

      userService.updateUser.mockRejectedValue(new Error('Email já cadastrado'));

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Email já cadastrado');
    });

    it('deve permitir atualização do próprio email', async () => {
      const updateData = { 
        email: 'admin@spsgroup.com.br' // Mesmo email do usuário
      };
      
      const mockUpdatedUser = { 
        id: 1, 
        name: 'Admin', 
        email: 'admin@spsgroup.com.br', 
        type: 'admin' 
      };
      
      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put('/users/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.email).toBe('admin@spsgroup.com.br');
    });
  });

  // Nota: Testes de autenticação são cobertos em tests/unit/middleware/guard.test.js
  // para evitar conflitos com o mock do middleware de autenticação
});

const Joi = require('joi');
const { 
  loginSchema, 
  createUserSchema, 
  updateUserSchema, 
  userIdSchema,
  paginationSchema,
  searchSchema 
} = require('../../../src/validations/schemas');

describe('Joi Validation Schemas', () => {
  describe('Login Schema', () => {
    it('deve validar dados de login válidos', () => {
      const validData = {
        email: 'admin@spsgroup.com.br',
        password: 'Admin@2024!'
      };

      const { error, value } = loginSchema.validate(validData);
      
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('deve rejeitar email inválido', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Admin@2024!'
      };

      const { error } = loginSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Formato de email inválido');
      expect(error.details[0].path).toEqual(['email']);
    });

    it('deve rejeitar email vazio', () => {
      const invalidData = {
        email: '',
        password: 'Admin@2024!'
      };

      const { error } = loginSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Email não pode estar vazio');
    });

    it('deve rejeitar email ausente', () => {
      const invalidData = {
        password: 'Admin@2024!'
      };

      const { error } = loginSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Email é obrigatório');
    });

    it('deve rejeitar senha muito curta', () => {
      const invalidData = {
        email: 'admin@spsgroup.com.br',
        password: '12'
      };

      const { error } = loginSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Senha deve ter pelo menos 3 caracteres');
    });

    it('deve rejeitar senha ausente', () => {
      const invalidData = {
        email: 'admin@spsgroup.com.br'
      };

      const { error } = loginSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Senha é obrigatória');
    });

    it('deve rejeitar múltiplos erros', () => {
      const invalidData = {};

      const { error } = loginSchema.validate(invalidData, { abortEarly: false });
      
      expect(error).toBeDefined();
      expect(error.details).toHaveLength(2);
      expect(error.details[0].message).toBe('Email é obrigatório');
      expect(error.details[1].message).toBe('Senha é obrigatória');
    });
  });

  describe('Create User Schema', () => {
    it('deve validar dados de criação válidos', () => {
      const validData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      const { error, value } = createUserSchema.validate(validData);
      
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('deve rejeitar nome muito curto', () => {
      const invalidData = {
        name: 'A',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      const { error } = createUserSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Nome deve ter pelo menos 2 caracteres');
    });

    it('deve rejeitar nome muito longo', () => {
      const invalidData = {
        name: 'A'.repeat(101),
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      const { error } = createUserSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Nome deve ter no máximo 100 caracteres');
    });

    it('deve rejeitar tipo inválido', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'invalid',
        password: 'Test123!@#'
      };

      const { error } = createUserSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Tipo deve ser "admin" ou "user"');
    });

    it('deve aceitar tipo admin', () => {
      const validData = {
        name: 'Admin User',
        email: 'admin@test.com',
        type: 'admin',
        password: 'Admin123!@#'
      };

      const { error } = createUserSchema.validate(validData);
      
      expect(error).toBeUndefined();
    });

    it('deve aceitar tipo user', () => {
      const validData = {
        name: 'Regular User',
        email: 'user@test.com',
        type: 'user',
        password: 'User123!@#'
      };

      const { error } = createUserSchema.validate(validData);
      
      expect(error).toBeUndefined();
    });
  });

  describe('Update User Schema', () => {
    it('deve validar atualização com dados válidos', () => {
      const validData = {
        name: 'Updated Name'
      };

      const { error, value } = updateUserSchema.validate(validData);
      
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('deve rejeitar objeto vazio', () => {
      const invalidData = {};

      const { error } = updateUserSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Pelo menos um campo deve ser fornecido para atualização');
    });

    it('deve aceitar atualização parcial', () => {
      const validData = {
        email: 'newemail@test.com'
      };

      const { error } = updateUserSchema.validate(validData);
      
      expect(error).toBeUndefined();
    });

    it('deve rejeitar email inválido na atualização', () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const { error } = updateUserSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Formato de email inválido');
    });

    it('deve rejeitar tipo inválido na atualização', () => {
      const invalidData = {
        type: 'invalid'
      };

      const { error } = updateUserSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Tipo deve ser "admin" ou "user"');
    });
  });

  describe('User ID Schema', () => {
    it('deve validar ID numérico válido', () => {
      const validData = { id: 123 };

      const { error, value } = userIdSchema.validate(validData);
      
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('deve rejeitar ID não numérico', () => {
      const invalidData = { id: 'abc' };

      const { error } = userIdSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('ID deve ser um número');
    });

    it('deve rejeitar ID vazio', () => {
      const invalidData = { id: '' };

      const { error } = userIdSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('ID deve ser um número');
    });

    it('deve rejeitar ID ausente', () => {
      const invalidData = {};

      const { error } = userIdSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('ID é obrigatório');
    });
  });

  describe('Pagination Schema', () => {
    it('deve validar paginação válida', () => {
      const validData = {
        page: 1,
        limit: 10
      };

      const { error, value } = paginationSchema.validate(validData);
      
      expect(error).toBeUndefined();
      expect(value).toEqual(validData);
    });

    it('deve usar valores padrão quando não fornecidos', () => {
      const data = {};

      const { error, value } = paginationSchema.validate(data);
      
      expect(error).toBeUndefined();
      expect(value.page).toBe(1);
      expect(value.limit).toBe(10);
    });

    it('deve rejeitar página inválida', () => {
      const invalidData = {
        page: 0,
        limit: 10
      };

      const { error } = paginationSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Página deve ser maior que 0');
    });

    it('deve rejeitar limite muito alto', () => {
      const invalidData = {
        page: 1,
        limit: 101
      };

      const { error } = paginationSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Limite deve ser menor ou igual a 100');
    });

    it('deve rejeitar página não numérica', () => {
      const invalidData = {
        page: 'abc',
        limit: 10
      };

      const { error } = paginationSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Página deve ser um número');
    });
  });

  describe('Search Schema', () => {
    it('deve validar busca válida', () => {
      const validData = {
        name: 'John',
        email: 'john@test.com',
        type: 'user'
      };

      const { error, value } = searchSchema.validate(validData);
      
      expect(error).toBeUndefined();
      expect(value).toEqual({
        ...validData,
        page: 1,
        limit: 10
      });
    });

    it('deve aceitar busca parcial', () => {
      const validData = {
        name: 'John'
      };

      const { error } = searchSchema.validate(validData);
      
      expect(error).toBeUndefined();
    });

    it('deve rejeitar termo de busca muito curto', () => {
      const invalidData = {
        name: ''
      };

      const { error } = searchSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Termo de busca não pode estar vazio');
    });

    it('deve rejeitar tipo inválido na busca', () => {
      const invalidData = {
        type: 'invalid'
      };

      const { error } = searchSchema.validate(invalidData);
      
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Tipo deve ser "admin" ou "user"');
    });

    it('deve aceitar tipo admin na busca', () => {
      const validData = {
        type: 'admin'
      };

      const { error } = searchSchema.validate(validData);
      
      expect(error).toBeUndefined();
    });

    it('deve aceitar tipo user na busca', () => {
      const validData = {
        type: 'user'
      };

      const { error } = searchSchema.validate(validData);
      
      expect(error).toBeUndefined();
    });
  });

  describe('Schema Options', () => {
    it('deve remover campos desconhecidos', () => {
      const dataWithExtra = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#',
        extraField: 'should be removed'
      };
      
      const { error, value } = createUserSchema.validate(dataWithExtra);
      
      expect(error).toBeDefined();
      expect(error.message).toContain('"extraField" is not allowed');
    });

    it('deve rejeitar campos desconhecidos quando allowUnknown é false', () => {
      const dataWithExtra = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#',
        extraField: 'should cause error'
      };

      const { error } = createUserSchema.validate(dataWithExtra, { allowUnknown: false });
      
      expect(error).toBeDefined();
    });
  });
});

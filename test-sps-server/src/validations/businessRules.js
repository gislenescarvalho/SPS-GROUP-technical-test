// Validações de regras de negócio
const UserDTO = require('../dtos/UserDTO');

// Validação de exclusão de admin principal
const validateAdminDeletion = (userId) => {
  if (userId === 1) {
    const error = new Error('Não é possível deletar o usuário admin principal');
    error.status = 403;
    error.type = 'BUSINESS_RULE_VIOLATION';
    throw error;
  }
};

// Validação de unicidade de email
const validateEmailUniqueness = (email, existingUser, excludeId = null) => {
  if (existingUser && existingUser.id !== excludeId) {
    const error = new Error('Email já cadastrado');
    error.status = 400;
    error.type = 'BUSINESS_RULE_VIOLATION';
    throw error;
  }
};

// Validação de permissões de usuário
const validateUserPermissions = (user, requiredType = null) => {
  if (!user) {
    const error = new Error('Usuário não autenticado');
    error.status = 401;
    error.type = 'AUTHENTICATION_ERROR';
    throw error;
  }

  if (requiredType && user.type !== requiredType) {
    const error = new Error('Permissão insuficiente');
    error.status = 403;
    error.type = 'AUTHORIZATION_ERROR';
    throw error;
  }
};

// Validação de força da senha
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const maxLength = 128;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Senha deve ter pelo menos ${minLength} caracteres`);
  }

  if (password.length > maxLength) {
    errors.push(`Senha deve ter no máximo ${maxLength} caracteres`);
  }

  if (!hasUpperCase) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!hasLowerCase) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!hasNumbers) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (!hasSpecialChar) {
    errors.push('Senha deve conter pelo menos um caractere especial (@$!%*?&)');
  }

  if (errors.length > 0) {
    const error = new Error('Senha não atende aos requisitos de segurança');
    error.status = 400;
    error.type = 'VALIDATION_ERROR';
    error.details = errors;
    throw error;
  }
};

// Validação de dados de usuário para criação
const validateUserCreation = (userData) => {
  const errors = [];

  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Email deve ter um formato válido');
  }

  if (!userData.type || !['admin', 'user'].includes(userData.type)) {
    errors.push('Tipo deve ser "admin" ou "user"');
  }

  if (userData.password) {
    try {
      validatePasswordStrength(userData.password);
    } catch (error) {
      errors.push(...error.details);
    }
  }

  if (errors.length > 0) {
    const error = new Error('Dados de usuário inválidos');
    error.status = 400;
    error.type = 'VALIDATION_ERROR';
    error.details = errors;
    throw error;
  }
};

// Validação de dados de usuário para atualização
const validateUserUpdate = (userData) => {
  const errors = [];

  if (userData.name !== undefined && userData.name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (userData.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Email deve ter um formato válido');
  }

  if (userData.type !== undefined && !['admin', 'user'].includes(userData.type)) {
    errors.push('Tipo deve ser "admin" ou "user"');
  }

  if (userData.password !== undefined) {
    try {
      validatePasswordStrength(userData.password);
    } catch (error) {
      errors.push(...error.details);
    }
  }

  if (errors.length > 0) {
    const error = new Error('Dados de usuário inválidos');
    error.status = 400;
    error.type = 'VALIDATION_ERROR';
    error.details = errors;
    throw error;
  }
};

// Validação de parâmetros de paginação
const validatePaginationParams = (page, limit) => {
  const errors = [];

  if (page && (isNaN(page) || page < 1)) {
    errors.push('Página deve ser um número maior que 0');
  }

  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    errors.push('Limite deve ser um número entre 1 e 100');
  }

  if (errors.length > 0) {
    const error = new Error('Parâmetros de paginação inválidos');
    error.status = 400;
    error.type = 'VALIDATION_ERROR';
    error.details = errors;
    throw error;
  }
};

module.exports = {
  validateAdminDeletion,
  validateEmailUniqueness,
  validateUserPermissions,
  validatePasswordStrength,
  validateUserCreation,
  validateUserUpdate,
  validatePaginationParams
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Acesso não autorizado',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  TOKEN_REQUIRED: 'Token de acesso necessário',
  TOKEN_INVALID: 'Token inválido ou expirado',
  
  VALIDATION_ERROR: 'Dados inválidos fornecidos',
  REQUIRED_FIELDS: 'Campos obrigatórios não fornecidos',
  INVALID_EMAIL: 'Formato de email inválido',
  INVALID_USER_TYPE: 'Tipo de usuário deve ser "admin" ou "user"',
  EMAIL_EXISTS: 'Email já cadastrado',
  INVALID_ID: 'ID deve ser um número válido',
  INVALID_PASSWORD: 'Senha deve ter pelo menos 3 caracteres',
  INVALID_NAME: 'Nome deve ter pelo menos 2 caracteres',
  INVALID_PAGINATION: 'Parâmetros de paginação inválidos',
  INVALID_SEARCH: 'Parâmetros de busca inválidos',
  
  USER_NOT_FOUND: 'Usuário não encontrado',
  RESOURCE_NOT_FOUND: 'Recurso não encontrado',
  
  FORBIDDEN: 'Acesso negado',
  ADMIN_DELETE_FORBIDDEN: 'Não é possível deletar o usuário admin principal',
  
  INTERNAL_ERROR: 'Erro interno do servidor',
  RATE_LIMIT_EXCEEDED: 'Muitas requisições. Tente novamente em alguns minutos.',
  
  CORS_ERROR: 'Origem não permitida'
};

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.errorWithContext(err, req);

  if (err.status) {
    return res.status(err.status).json({
      error: err.message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: ERROR_MESSAGES.CORS_ERROR,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (err.type === 'VALIDATION_ERROR') {
    return res.status(400).json({
      error: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (err.message.includes('obrigatórios')) {
    return res.status(400).json({
      error: err.message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (err.message.includes('inválidas')) {
    return res.status(401).json({
      error: err.message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (err.message.includes('encontrado')) {
    return res.status(404).json({
      error: err.message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (err.message.includes('cadastrado')) {
    return res.status(400).json({
      error: err.message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  if (err.message.includes('admin principal')) {
    return res.status(403).json({
      error: err.message,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }

  res.status(500).json({
    error: ERROR_MESSAGES.INTERNAL_ERROR,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

const Joi = require('joi');

// Middleware de validação genérico
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Retorna todos os erros, não apenas o primeiro
      stripUnknown: false, // Não remove campos não definidos no schema
      allowUnknown: false // Não permite campos desconhecidos
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      // Retornar mensagem específica se houver apenas um erro
      // Ou mensagem detalhada se houver múltiplos erros
      let errorMessage;
      if (errorDetails.length === 1) {
        errorMessage = errorDetails[0].message;
      } else {
        // Para múltiplos erros, criar uma mensagem mais informativa
        const fieldMessages = errorDetails.map(detail => 
          `${detail.field}: ${detail.message}`
        ).join('; ');
        errorMessage = `Múltiplos erros de validação: ${fieldMessages}`;
      }

      const validationError = new Error(errorMessage);
      validationError.status = 400;
      validationError.details = errorDetails;
      validationError.type = 'VALIDATION_ERROR';
      
      return next(validationError);
    }

    // Atualiza o objeto com os dados validados
    req[property] = value;
    next();
  };
};

// Middleware específico para validação de body
const validateBody = (schema) => validate(schema, 'body');

// Middleware específico para validação de query
const validateQuery = (schema) => validate(schema, 'query');

// Middleware específico para validação de params
const validateParams = (schema) => validate(schema, 'params');

// Middleware para validação de ID numérico
const validateId = (req, res, next) => {
  const idSchema = Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'ID deve ser um número',
        'number.integer': 'ID deve ser um número inteiro',
        'number.positive': 'ID deve ser um número positivo',
        'any.required': 'ID é obrigatório'
      })
  });

  const { error } = idSchema.validate({ id: parseInt(req.params.id) });

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400;
    validationError.type = 'VALIDATION_ERROR';
    return next(validationError);
  }

  next();
};

// Middleware para validação de email único
const validateEmailUnique = (req, res, next) => {
  const emailSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Formato de email inválido',
        'any.required': 'Email é obrigatório',
        'string.empty': 'Email não pode estar vazio'
      })
  });

  const { error } = emailSchema.validate({ email: req.body.email });

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400;
    validationError.type = 'VALIDATION_ERROR';
    return next(validationError);
  }

  next();
};

// Middleware para validação de senha forte (opcional)
const validateStrongPassword = (req, res, next) => {
  const passwordSchema = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.min': 'Senha deve ter pelo menos 8 caracteres',
      'string.pattern.base': 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial'
    });

  const { error } = passwordSchema.validate(req.body.password);

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400;
    validationError.type = 'VALIDATION_ERROR';
    return next(validationError);
  }

  next();
};

// Middleware para validação de paginação
const validatePagination = (req, res, next) => {
  const paginationSchema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Página deve ser um número',
        'number.integer': 'Página deve ser um número inteiro',
        'number.min': 'Página deve ser maior que 0'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limite deve ser um número',
        'number.integer': 'Limite deve ser um número inteiro',
        'number.min': 'Limite deve ser maior que 0',
        'number.max': 'Limite deve ser menor ou igual a 100'
      })
  });

  const { error, value } = paginationSchema.validate(req.query);

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400;
    validationError.type = 'VALIDATION_ERROR';
    return next(validationError);
  }

  // Atualiza query com valores padrão se necessário
  req.query = { ...req.query, ...value };
  next();
};

// Middleware para validação de filtros de busca
const validateSearch = (req, res, next) => {
  const searchSchema = Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Termo de busca deve ter pelo menos 1 caractere',
        'string.max': 'Termo de busca deve ter no máximo 100 caracteres',
        'string.empty': 'Termo de busca não pode estar vazio'
      }),
    email: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Termo de busca deve ter pelo menos 1 caractere',
        'string.max': 'Termo de busca deve ter no máximo 100 caracteres',
        'string.empty': 'Termo de busca não pode estar vazio'
      }),
    type: Joi.string()
      .valid('admin', 'user')
      .optional()
      .messages({
        'any.only': 'Tipo deve ser "admin" ou "user"',
        'string.empty': 'Tipo não pode estar vazio'
      }),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .optional()
      .messages({
        'number.base': 'Página deve ser um número',
        'number.integer': 'Página deve ser um número inteiro',
        'number.min': 'Página deve ser maior que 0'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .optional()
      .messages({
        'number.base': 'Limite deve ser um número',
        'number.integer': 'Limite deve ser um número inteiro',
        'number.min': 'Limite deve ser maior que 0',
        'number.max': 'Limite deve ser menor ou igual a 100'
      })
  });

  const { error, value } = searchSchema.validate(req.query);

  if (error) {
    const validationError = new Error(error.details[0].message);
    validationError.status = 400;
    validationError.type = 'VALIDATION_ERROR';
    return next(validationError);
  }

  // Atualiza query com valores padrão se necessário
  req.query = { ...req.query, ...value };
  next();
};

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateId,
  validateEmailUnique,
  validateStrongPassword,
  validatePagination,
  validateSearch
};

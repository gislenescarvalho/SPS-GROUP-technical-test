const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Formato de email inválido',
      'any.required': 'Email é obrigatório',
      'string.empty': 'Email não pode estar vazio'
    }),
  password: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 3 caracteres',
      'any.required': 'Senha é obrigatória',
      'string.empty': 'Senha não pode estar vazia'
    })
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token é obrigatório',
      'string.empty': 'Refresh token não pode estar vazio'
    })
});

const createUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório',
      'string.empty': 'Nome não pode estar vazio'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Formato de email inválido',
      'any.required': 'Email é obrigatório',
      'string.empty': 'Email não pode estar vazio'
    }),
  type: Joi.string()
    .valid('admin', 'user')
    .required()
    .messages({
      'any.only': 'Tipo deve ser "admin" ou "user"',
      'any.required': 'Tipo é obrigatório',
      'string.empty': 'Tipo não pode estar vazio'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 8 caracteres',
      'string.max': 'Senha deve ter no máximo 128 caracteres',
      'string.pattern.base': 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
      'any.required': 'Senha é obrigatória',
      'string.empty': 'Senha não pode estar vazia'
    })
});

const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'string.empty': 'Nome não pode estar vazio'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      'string.email': 'Formato de email inválido',
      'string.empty': 'Email não pode estar vazio'
    }),
  type: Joi.string()
    .valid('admin', 'user')
    .optional()
    .messages({
      'any.only': 'Tipo deve ser "admin" ou "user"',
      'string.empty': 'Tipo não pode estar vazio'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .optional()
    .messages({
      'string.min': 'Senha deve ter pelo menos 8 caracteres',
      'string.max': 'Senha deve ter no máximo 128 caracteres',
      'string.pattern.base': 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
      'string.empty': 'Senha não pode estar vazia'
    })
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

const userIdSchema = Joi.object({
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

module.exports = {
  loginSchema,
  refreshTokenSchema,
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  paginationSchema,
  searchSchema
};

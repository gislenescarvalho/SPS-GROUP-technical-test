const Joi = require('joi');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: false,
      allowUnknown: false
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      let errorMessage;
      if (errorDetails.length === 1) {
        errorMessage = errorDetails[0].message;
      } else {
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

    req[property] = value;
    next();
  };
};

const validateBody = (schema) => validate(schema, 'body');

const validateQuery = (schema) => validate(schema, 'query');

const validateParams = (schema) => validate(schema, 'params');

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

  req.query = { ...req.query, ...value };
  next();
};

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateId,
  validateSearch
};

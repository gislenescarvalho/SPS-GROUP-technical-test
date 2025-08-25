import * as yup from 'yup';

// Schema de validação para criação de usuário
export const createUserSchema = yup.object().shape({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .lowercase(),
  
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
    .matches(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .matches(/\d/, 'Senha deve conter pelo menos um número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial'),
  
  confirmPassword: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('password'), null], 'As senhas devem ser iguais'),
  
  type: yup
    .string()
    .required('Tipo é obrigatório')
    .oneOf(['user', 'admin'], 'Tipo deve ser "user" ou "admin"')
});

// Schema de validação para atualização de usuário
export const updateUserSchema = yup.object().shape({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  
  password: yup
    .string()
    .nullable()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres')
    .matches(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .matches(/\d/, 'Senha deve conter pelo menos um número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial'),
  
  confirmPassword: yup
    .string()
    .nullable()
    .when('password', {
      is: (password) => password && password.length > 0,
      then: (schema) => schema
        .required('Confirmação de senha é obrigatória')
        .oneOf([yup.ref('password'), null], 'As senhas devem ser iguais'),
      otherwise: (schema) => schema.nullable()
    }),
  
  type: yup
    .string()
    .required('Tipo é obrigatório')
    .oneOf(['user', 'admin'], 'Tipo deve ser "user" ou "admin"')
});

// Schema de validação para login
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email deve ter um formato válido'),
  
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(1, 'Senha é obrigatória')
});

// Função para validar dados
export const validateData = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

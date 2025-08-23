import { useState, useCallback } from 'react';

export const useValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validar campo específico
  const validateField = useCallback(async (fieldName, value) => {
    try {
      await schema.validateAt(fieldName, { [fieldName]: value });
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error.message }));
      return false;
    }
  }, [schema]);

  // Validar todos os campos
  const validateAll = useCallback(async (data) => {
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      const newErrors = {};
      error.inner.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return { isValid: false, errors: newErrors };
    }
  }, [schema]);

  // Marcar campo como tocado
  const setFieldTouched = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  // Verificar se campo tem erro e foi tocado
  const hasError = useCallback((fieldName) => {
    return touched[fieldName] && errors[fieldName];
  }, [touched, errors]);

  return {
    errors,
    touched,
    validateField,
    validateAll,
    setFieldTouched,
    clearErrors,
    hasError
  };
};

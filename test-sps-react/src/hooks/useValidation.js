import { useState, useCallback } from 'react';
import * as yup from 'yup';

const useValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(async (field, value) => {
    try {
      await schema.validateAt(field, { [field]: value });
      setErrors(prev => ({ ...prev, [field]: null }));
      return null;
    } catch (error) {
      const fieldError = error.message;
      setErrors(prev => ({ ...prev, [field]: fieldError }));
      return fieldError;
    }
  }, [schema]);

  const validateAll = useCallback(async (data) => {
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors({});
      return { isValid: true, errors: {} };
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
      return { isValid: false, errors: validationErrors };
    }
  }, [schema]);

  const setFieldTouched = useCallback((field, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const setAllTouched = useCallback((isTouched = true) => {
    const allFields = Object.keys(schema.fields);
    const touchedState = {};
    allFields.forEach(field => {
      touchedState[field] = isTouched;
    });
    setTouched(touchedState);
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  const hasError = useCallback((field) => {
    return errors[field] && touched[field];
  }, [errors, touched]);

  const hasAnyError = useCallback(() => {
    return Object.keys(errors).some(field => errors[field]);
  }, [errors]);

  const getFieldError = useCallback((field) => {
    return hasError(field) ? errors[field] : null;
  }, [errors, touched]);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateAll,
    setFieldTouched,
    setAllTouched,
    clearErrors,
    clearFieldError,
    hasError,
    hasAnyError,
    getFieldError,
    reset
  };
};

export default useValidation;

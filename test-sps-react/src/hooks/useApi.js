import { useState, useCallback } from 'react';

const useApi = (apiCall) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    if (!apiCall) {
      throw new Error('API call function is required');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    clearError,
  };
};

export default useApi;

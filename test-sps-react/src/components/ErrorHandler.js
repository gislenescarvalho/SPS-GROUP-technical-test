import React, { useState, useCallback } from 'react';
import { logSecurityEvent } from '../middleware/security';

const ErrorHandler = ({ error, variant = 'error', onDismiss, showDetails = false }) => {
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  const handleDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  const toggleDetails = useCallback(() => {
    setShowFullDetails(prev => !prev);
  }, []);

  const logError = useCallback(() => {
    if (error) {
      // Não registrar erros de UI comuns como eventos de segurança
      const isSecurityError = error.securityRelated || 
                             error.type === 'security' || 
                             error.message?.includes('segurança') ||
                             error.message?.includes('token') ||
                             error.message?.includes('autenticação');
      
      if (isSecurityError) {
        logSecurityEvent('ui_error', {
          message: error.message,
          stack: error.stack,
          variant,
          timestamp: new Date().toISOString(),
          securityRelated: true
        });
      } else if (process.env.NODE_ENV === 'development') {
        // Apenas log em desenvolvimento para erros de UI comuns
        console.warn('UI Error:', {
          message: error.message,
          variant,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [error, variant]);

  React.useEffect(() => {
    logError();
  }, [logError]);

  if (!error) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-400',
          button: 'text-yellow-800 hover:bg-yellow-100'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-400',
          button: 'text-blue-800 hover:bg-blue-100'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-400',
          button: 'text-red-800 hover:bg-red-100'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`border rounded-md p-4 ${styles.container}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {variant === 'warning' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {variant === 'info' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
          {variant === 'error' && (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {variant === 'warning' && 'Aviso'}
            {variant === 'info' && 'Informação'}
            {variant === 'error' && 'Erro'}
          </h3>
          
          <div className="mt-2 text-sm">
            <p>{error.message || 'Ocorreu um erro inesperado.'}</p>
            
            {showFullDetails && error.stack && (
              <details className="mt-3">
                <summary className="cursor-pointer font-medium">Detalhes técnicos</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
        
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            {onDismiss && (
              <button
                onClick={handleDismiss}
                className={`inline-flex rounded-md p-1.5 ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {!showFullDetails && error.stack && (
        <div className="mt-3">
          <button
            onClick={toggleDetails}
            className={`text-sm ${styles.button} underline`}
          >
            {showFullDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'}
          </button>
        </div>
      )}
    </div>
  );
};

export const useErrorHandler = () => {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((error) => {
    const id = Date.now() + Math.random();
    setErrors(prev => [...prev, { id, error, timestamp: new Date() }]);
  }, []);

  const removeError = useCallback((id) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getErrors = useCallback(() => {
    return errors;
  }, [errors]);

  // Componente ErrorList que renderiza a lista de erros
  const ErrorList = ({ variant = 'error', showDetails = false }) => {
    if (errors.length === 0) return null;

    return (
      <div>
        {errors.map(({ id, error }) => (
          <ErrorHandler
            key={id}
            error={error}
            variant={variant}
            showDetails={showDetails}
            onDismiss={() => removeError(id)}
          />
        ))}
      </div>
    );
  };

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    getErrors,
    ErrorList
  };
};

export default ErrorHandler;


import React from 'react';
import { logSecurityEvent } from '../middleware/security';

/**
 * Componente para exibir mensagens de erro de forma consistente
 */
const ErrorHandler = ({ 
  error, 
  onRetry, 
  onClose, 
  showDetails = false,
  variant = 'error' // 'error', 'warning', 'info'
}) => {
  if (!error) return null;

  const getErrorIcon = () => {
    switch (variant) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'error':
      default:
        return '❌';
    }
  };

  const getErrorStyle = () => {
    const baseStyle = {
      padding: 'var(--spacing-md)',
      borderRadius: '4px',
      marginBottom: 'var(--spacing-md)',
      fontSize: 'var(--font-size-medium)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--spacing-sm)',
      border: '1px solid',
      position: 'relative'
    };

    switch (variant) {
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: 'var(--warning-color)',
          color: 'white',
          borderColor: 'var(--warning-color)'
        };
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: 'var(--info-color)',
          color: 'white',
          borderColor: 'var(--info-color)'
        };
      case 'error':
      default:
        return {
          ...baseStyle,
          backgroundColor: 'var(--danger-color)',
          color: 'white',
          borderColor: 'var(--danger-color)'
        };
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      logSecurityEvent('error_retry', { 
        error: error.message,
        url: window.location.href 
      });
      onRetry();
    }
  };

  const handleClose = () => {
    if (onClose) {
      logSecurityEvent('error_dismissed', { 
        error: error.message,
        url: window.location.href 
      });
      onClose();
    }
  };

  return (
    <div style={getErrorStyle()} role="alert" aria-live="assertive">
      <div style={{ fontSize: '20px', flexShrink: 0 }}>
        {getErrorIcon()}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: 'var(--spacing-xs)' 
        }}>
          {error.title || 'Erro'}
        </div>
        
        <div style={{ 
          lineHeight: '1.4',
          marginBottom: showDetails ? 'var(--spacing-sm)' : 0
        }}>
          {error.userMessage || error.message || 'Ocorreu um erro inesperado.'}
        </div>
        
        {showDetails && error.details && (
          <details style={{ 
            marginTop: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-small)'
          }}>
            <summary style={{ 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>
              Detalhes técnicos
            </summary>
            <pre style={{
              marginTop: 'var(--spacing-xs)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: 'var(--font-size-small)',
              opacity: 0.8
            }}>
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
        
        {(onRetry || onClose) && (
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginTop: 'var(--spacing-sm)',
            flexWrap: 'wrap'
          }}>
            {onRetry && (
              <button
                onClick={handleRetry}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  transition: 'all 0.3s ease'
                }}
                aria-label="Tentar novamente"
              >
                🔄 Tentar Novamente
              </button>
            )}
            
            {onClose && (
              <button
                onClick={handleClose}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-small)',
                  transition: 'all 0.3s ease'
                }}
                aria-label="Fechar mensagem de erro"
              >
                ✕ Fechar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook para gerenciar erros de forma consistente
 */
export const useErrorHandler = () => {
  const [errors, setErrors] = React.useState([]);

  const addError = (error) => {
    const errorId = Date.now().toString();
    const errorWithId = {
      ...error,
      id: errorId,
      timestamp: new Date().toISOString()
    };
    
    setErrors(prev => [...prev, errorWithId]);
    
    // Log do erro
    logSecurityEvent('error_added', {
      error: error.message,
      userMessage: error.userMessage,
      url: window.location.href
    });
    
    return errorId;
  };

  const removeError = (errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const ErrorList = ({ variant = 'error', showDetails = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {errors.map(error => (
        <ErrorHandler
          key={error.id}
          error={error}
          variant={variant}
          showDetails={showDetails}
          onClose={() => removeError(error.id)}
        />
      ))}
    </div>
  );

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    ErrorList
  };
};

export default ErrorHandler;


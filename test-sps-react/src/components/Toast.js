import React, { useState, useEffect, useCallback } from 'react';

const Toast = ({ message, type = 'info', duration = 5000, onClose, id }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose(id);
      }
    }, 300);
  }, [onClose, id]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getToastStyles = () => {
    const baseStyles = {
      position: 'relative',
      padding: 'var(--spacing-md)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      marginBottom: 'var(--spacing-sm)',
      maxWidth: '400px',
      minWidth: '300px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--spacing-sm)',
      transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
      opacity: isExiting ? 0 : 1,
      transition: 'all 0.3s ease-in-out',
      zIndex: 1000,
      border: '1px solid',
      fontSize: 'var(--font-size-medium)',
      lineHeight: '1.4'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: 'var(--success-color)',
          color: 'white',
          borderColor: 'var(--success-color)'
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: 'var(--error-color)',
          color: 'white',
          borderColor: 'var(--error-color)'
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: 'var(--warning-color)',
          color: 'white',
          borderColor: 'var(--warning-color)'
        };
      case 'info':
      default:
        return {
          ...baseStyles,
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          borderColor: 'var(--primary-color)'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={getToastStyles()}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span style={{ fontSize: '20px', flexShrink: 0 }}>
        {getIcon()}
      </span>
      
      <div style={{ flex: 1, wordBreak: 'break-word' }}>
        {message}
      </div>
      
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '4px',
          fontSize: '18px',
          opacity: 0.8,
          transition: 'opacity 0.2s ease',
          flexShrink: 0,
          minWidth: '24px',
          minHeight: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;

import React, { useState, useEffect } from 'react';
import useSession from '../hooks/useSession';
import { logSecurityEvent } from '../middleware/security';

/**
 * Componente para exibir avisos de sessão
 * Inclui avisos de expiração e opções para renovar ou estender a sessão
 */
const SessionWarning = () => {
  const {
    sessionWarning,
    timeRemaining,
    isInactive,
    isSessionActive,
    renewSession,
    extendSession,
    formatTimeRemaining,
    isNearExpiry,
    isExpired,
    needsRenewal,
    sessionError,
    isRefreshing
  } = useSession();

  const [showWarning, setShowWarning] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Contador regressivo para expiração
  useEffect(() => {
    if (!sessionWarning || !timeRemaining || timeRemaining <= 0) {
      setCountdown(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, timeRemaining - 1000);
      setCountdown(remaining);
      
      if (remaining <= 0) {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionWarning, timeRemaining]);

  // Mostrar aviso quando necessário
  useEffect(() => {
    if (sessionWarning || isInactive || isExpired || sessionError) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [sessionWarning, isInactive, isExpired, sessionError]);

  // Handler para renovar sessão
  const handleRenewSession = async () => {
    setIsRenewing(true);
    try {
      const success = await renewSession();
      if (success) {
        setShowWarning(false);
        logSecurityEvent('session_warning_renewed', {
          timeRemaining: timeRemaining
        });
      }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
    } finally {
      setIsRenewing(false);
    }
  };

  // Handler para estender sessão
  const handleExtendSession = () => {
    extendSession();
    setShowWarning(false);
    logSecurityEvent('session_warning_extended', {
      timeRemaining: timeRemaining
    });
  };

  // Handler para fechar aviso
  const handleCloseWarning = () => {
    setShowWarning(false);
    logSecurityEvent('session_warning_dismissed', {
      timeRemaining: timeRemaining
    });
  };

  // Se não há aviso para mostrar, não renderizar nada
  if (!showWarning) {
    return null;
  }

  // Determinar tipo de aviso
  let warningType = 'info';
  let title = 'Aviso de Sessão';
  let message = '';
  let showActions = true;

  if (sessionError) {
    warningType = 'error';
    title = 'Erro de Sessão';
    message = sessionError;
    showActions = false;
  } else if (isExpired) {
    warningType = 'error';
    title = 'Sessão Expirada';
    message = 'Sua sessão expirou. Você será redirecionado para a página de login.';
    showActions = false;
  } else if (isInactive) {
    warningType = 'warning';
    title = 'Sessão Inativa';
    message = 'Você está inativo há muito tempo. Sua sessão será encerrada em breve.';
  } else if (needsRenewal) {
    warningType = 'warning';
    title = 'Sessão Expirando';
    message = `Sua sessão expirará em ${formatTimeRemaining()}. Deseja renovar?`;
  } else if (isNearExpiry) {
    warningType = 'info';
    title = 'Sessão Próxima da Expiração';
    message = `Sua sessão expirará em ${formatTimeRemaining()}.`;
  }

  return (
    <div className="session-warning-overlay">
      <div className={`session-warning-modal ${warningType}`}>
        <div className="session-warning-header">
          <h3>{title}</h3>
          {showActions && (
            <button 
              className="session-warning-close"
              onClick={handleCloseWarning}
              aria-label="Fechar aviso"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="session-warning-content">
          <p>{message}</p>
          
          {countdown !== null && countdown > 0 && (
            <div className="session-warning-countdown">
              <span>Tempo restante: {Math.floor(countdown / 60000)}m {Math.floor((countdown % 60000) / 1000)}s</span>
            </div>
          )}
          
          {isRefreshing && (
            <div className="session-warning-loading">
              <span>Renovando sessão...</span>
            </div>
          )}
          
          {showActions && isSessionActive && !isExpired && (
            <div className="session-warning-actions">
              {needsRenewal && (
                <button
                  className="session-warning-btn primary"
                  onClick={handleRenewSession}
                  disabled={isRenewing || isRefreshing}
                >
                  {isRenewing || isRefreshing ? 'Renovando...' : 'Renovar Sessão'}
                </button>
              )}
              
              <button
                className="session-warning-btn secondary"
                onClick={handleExtendSession}
                disabled={isRefreshing}
              >
                Estender Sessão
              </button>
              
              <button
                className="session-warning-btn tertiary"
                onClick={handleCloseWarning}
                disabled={isRefreshing}
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .session-warning-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .session-warning-modal {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          max-width: 400px;
          width: 90%;
          animation: slideIn 0.3s ease-out;
        }
        
        .session-warning-modal.error {
          border-left: 4px solid #dc3545;
        }
        
        .session-warning-modal.warning {
          border-left: 4px solid #ffc107;
        }
        
        .session-warning-modal.info {
          border-left: 4px solid #17a2b8;
        }
        
        .session-warning-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .session-warning-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .session-warning-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        
        .session-warning-close:hover {
          background-color: #f8f9fa;
        }
        
        .session-warning-content {
          padding: 20px;
        }
        
        .session-warning-content p {
          margin: 0 0 16px 0;
          color: #495057;
          line-height: 1.5;
        }
        
        .session-warning-countdown {
          background-color: #f8f9fa;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          text-align: center;
          font-weight: 600;
          color: #dc3545;
        }
        
        .session-warning-loading {
          background-color: #e3f2fd;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          text-align: center;
          font-weight: 500;
          color: #1976d2;
        }
        
        .session-warning-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .session-warning-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          flex: 1;
          min-width: 100px;
        }
        
        .session-warning-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .session-warning-btn.primary {
          background-color: #007bff;
          color: white;
        }
        
        .session-warning-btn.primary:hover:not(:disabled) {
          background-color: #0056b3;
        }
        
        .session-warning-btn.primary:disabled {
          background-color: #6c757d;
        }
        
        .session-warning-btn.secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .session-warning-btn.secondary:hover:not(:disabled) {
          background-color: #545b62;
        }
        
        .session-warning-btn.tertiary {
          background-color: transparent;
          color: #6c757d;
          border: 1px solid #6c757d;
        }
        
        .session-warning-btn.tertiary:hover:not(:disabled) {
          background-color: #6c757d;
          color: white;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 480px) {
          .session-warning-modal {
            width: 95%;
            margin: 10px;
          }
          
          .session-warning-actions {
            flex-direction: column;
          }
          
          .session-warning-btn {
            flex: none;
          }
        }
        `
      }} />
    </div>
  );
};

export default SessionWarning;

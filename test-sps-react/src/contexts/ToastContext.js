import React, { createContext, useContext } from 'react';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext();

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext deve ser usado dentro de um ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const toastHook = useToast();

  return (
    <ToastContext.Provider value={toastHook}>
      {children}
      <ToastContainer 
        toasts={toastHook.toasts} 
        onRemoveToast={toastHook.removeToast} 
      />
    </ToastContext.Provider>
  );
};

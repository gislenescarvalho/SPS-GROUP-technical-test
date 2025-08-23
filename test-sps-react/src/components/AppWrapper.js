import React from 'react';
import { Outlet } from 'react-router-dom';
import SessionWarning from './SessionWarning';
import ErrorHandler from './ErrorHandler';

/**
 * Componente wrapper principal da aplicação
 * Inclui componentes globais como avisos de sessão e tratamento de erros
 */
const AppWrapper = () => {
  return (
    <>
      <Outlet />
      <SessionWarning />
      <ErrorHandler />
    </>
  );
};

export default AppWrapper;

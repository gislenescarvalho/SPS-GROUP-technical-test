import React from 'react';
import { Outlet } from 'react-router-dom';
import SessionWarning from './SessionWarning';

/**
 * Componente wrapper principal da aplicação
 * Inclui componentes globais como avisos de sessão
 */
const AppWrapper = () => {
  return (
    <>
      <Outlet />
      <SessionWarning />
    </>
  );
};

export default AppWrapper;

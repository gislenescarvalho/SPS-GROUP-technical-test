import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children }) => {
  // Sempre chamar o hook no topo do componente
  const authContext = useAuth();

  // Verificar se o contexto tem as propriedades necessárias
  if (!authContext || typeof authContext !== 'object') {
    return <Navigate to="/signin" replace />;
  }

  const { isAuthenticated, isLoading } = authContext;

  if (isLoading) {
    return <Loader text="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;

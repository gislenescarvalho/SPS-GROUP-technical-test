import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) {
    return null; // Não mostrar navbar se não estiver logado
  }

  return (
    <nav style={{
      backgroundColor: "var(--background-secondary)",
      padding: "var(--spacing-md) var(--spacing-xl)",
      color: "var(--text-color)",
      marginBottom: "var(--spacing-xl)",
      borderBottom: "1px solid var(--border-color)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "var(--container-max-width)",
        margin: "0 auto"
      }}>
        {/* Logo e título */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
          <Link
            to="/"
            style={{
              color: "var(--text-color)",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "var(--font-size-large)",
              whiteSpace: "nowrap"
            }}
            aria-label="Página inicial"
          >
            SPS React Test
          </Link>
          
          {/* Menu desktop */}
          <div style={{ 
            display: "flex", 
            gap: "var(--spacing-md)",
            display: window.innerWidth > 768 ? "flex" : "none"
          }}>
            <Link
              to="/"
              style={{
                color: location.pathname === "/" ? "var(--primary-color)" : "var(--text-color)",
                textDecoration: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                backgroundColor: location.pathname === "/" ? "rgba(0, 123, 255, 0.1)" : "transparent",
                transition: "background-color 0.3s ease",
                minHeight: "44px",
                display: "flex",
                alignItems: "center"
              }}
              aria-label="Página inicial"
              aria-current={location.pathname === "/" ? "page" : undefined}
            >
              Home
            </Link>
            <Link
              to="/users"
              style={{
                color: location.pathname === "/users" ? "var(--primary-color)" : "var(--text-color)",
                textDecoration: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                backgroundColor: location.pathname === "/users" ? "rgba(0, 123, 255, 0.1)" : "transparent",
                transition: "background-color 0.3s ease",
                minHeight: "44px",
                display: "flex",
                alignItems: "center"
              }}
              aria-label="Gerenciar usuários"
              aria-current={location.pathname === "/users" ? "page" : undefined}
            >
              Usuários
            </Link>
            {user.type === 'admin' && (
              <Link
                to="/metrics"
                style={{
                  color: location.pathname === "/metrics" ? "var(--primary-color)" : "var(--text-color)",
                  textDecoration: "none",
                  padding: "var(--spacing-sm) var(--spacing-md)",
                  borderRadius: "4px",
                  backgroundColor: location.pathname === "/metrics" ? "rgba(0, 123, 255, 0.1)" : "transparent",
                  transition: "background-color 0.3s ease",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center"
                }}
                aria-label="Métricas do sistema"
                aria-current={location.pathname === "/metrics" ? "page" : undefined}
              >
                📊 Métricas
              </Link>
            )}
          </div>
        </div>

        {/* Botão mobile menu */}
        <button
          onClick={toggleMobileMenu}
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: "var(--font-size-large)",
            color: "var(--text-color)",
            cursor: "pointer",
            padding: "var(--spacing-sm)",
            minHeight: "44px",
            minWidth: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Informações do usuário e logout - desktop */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "var(--spacing-md)",
          display: window.innerWidth > 768 ? "flex" : "none"
        }}>
          <span style={{ 
            fontSize: "var(--font-size-small)",
            color: "var(--text-secondary)",
            whiteSpace: "nowrap"
          }}>
            Olá, {user.name} ({user.type})
          </span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "var(--danger-color)",
              color: "white",
              border: "none",
              padding: "var(--spacing-sm) var(--spacing-md)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "var(--font-size-small)",
              transition: "background-color 0.3s ease",
              minHeight: "44px",
              whiteSpace: "nowrap"
            }}
            aria-label="Sair do sistema"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--warning-color)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "var(--danger-color)";
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div style={{
          marginTop: "var(--spacing-md)",
          paddingTop: "var(--spacing-md)",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-sm)"
        }}>
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              color: location.pathname === "/" ? "var(--primary-color)" : "var(--text-color)",
              textDecoration: "none",
              padding: "var(--spacing-md)",
              borderRadius: "4px",
              backgroundColor: location.pathname === "/" ? "rgba(0, 123, 255, 0.1)" : "transparent",
              transition: "background-color 0.3s ease",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-label="Página inicial"
            aria-current={location.pathname === "/" ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            to="/users"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              color: location.pathname === "/users" ? "var(--primary-color)" : "var(--text-color)",
              textDecoration: "none",
              padding: "var(--spacing-md)",
              borderRadius: "4px",
              backgroundColor: location.pathname === "/users" ? "rgba(0, 123, 255, 0.1)" : "transparent",
              transition: "background-color 0.3s ease",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-label="Gerenciar usuários"
            aria-current={location.pathname === "/users" ? "page" : undefined}
          >
            Usuários
          </Link>
          {user.type === 'admin' && (
            <Link
              to="/metrics"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                color: location.pathname === "/metrics" ? "var(--primary-color)" : "var(--text-color)",
                textDecoration: "none",
                padding: "var(--spacing-md)",
                borderRadius: "4px",
                backgroundColor: location.pathname === "/metrics" ? "rgba(0, 123, 255, 0.1)" : "transparent",
                transition: "background-color 0.3s ease",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              aria-label="Métricas do sistema"
              aria-current={location.pathname === "/metrics" ? "page" : undefined}
            >
              📊 Métricas
            </Link>
          )}
          
          {/* Informações do usuário - mobile */}
          <div style={{
            padding: "var(--spacing-md)",
            borderTop: "1px solid var(--border-color)",
            marginTop: "var(--spacing-sm)"
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-sm)",
              alignItems: "center"
            }}>
              <span style={{ 
                fontSize: "var(--font-size-small)",
                color: "var(--text-secondary)",
                textAlign: "center"
              }}>
                Olá, {user.name} ({user.type})
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  backgroundColor: "var(--danger-color)",
                  color: "white",
                  border: "none",
                  padding: "var(--spacing-sm) var(--spacing-md)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "var(--font-size-small)",
                  transition: "background-color 0.3s ease",
                  minHeight: "44px",
                  width: "100%",
                  maxWidth: "200px"
                }}
                aria-label="Sair do sistema"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

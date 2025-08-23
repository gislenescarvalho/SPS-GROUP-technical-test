import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import Navbar from "../components/Navbar";
import AccessibilityPanel from "../components/AccessibilityPanel";

function Home() {
  const { user } = useAuth();
  const { theme } = useAccessibility();

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: "var(--spacing-xl) 0" }}>
        <div style={{
          backgroundColor: "var(--background-color)",
          padding: "var(--spacing-xl)",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid var(--border-color)",
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          <h1 style={{ 
            marginBottom: "var(--spacing-xl)", 
            color: "var(--text-color)",
            fontSize: "var(--font-size-xlarge)",
            textAlign: "center"
          }}>
            Bem-vindo ao Sistema de Gerenciamento de Usuários
          </h1>
          
          <p style={{ 
            marginBottom: "var(--spacing-xl)", 
            color: "var(--text-secondary)", 
            fontSize: "var(--font-size-large)",
            textAlign: "center",
            lineHeight: "1.6"
          }}>
            Este é um sistema de demonstração para gerenciamento de usuários com autenticação JWT.
            Use as funcionalidades abaixo para gerenciar os usuários do sistema.
          </p>

          <div style={{ 
            display: "grid", 
            gap: "var(--spacing-lg)",
            marginBottom: "var(--spacing-xl)"
          }}>
            <Link
              to="/users"
              style={{
                display: "block",
                backgroundColor: "var(--primary-color)",
                color: "white",
                textDecoration: "none",
                padding: "var(--spacing-lg)",
                borderRadius: "8px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "var(--font-size-large)",
                transition: "all 0.3s ease",
                minHeight: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--info-color)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--primary-color)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Gerenciar Usuários
            </Link>
          </div>

          {user && (
            <div style={{ 
              marginBottom: "var(--spacing-xl)", 
              padding: "var(--spacing-xl)", 
              backgroundColor: "var(--background-secondary)", 
              borderRadius: "8px",
              border: "1px solid var(--border-color)"
            }}>
              <h3 style={{ 
                marginBottom: "var(--spacing-md)", 
                color: "var(--text-color)",
                fontSize: "var(--font-size-large)",
                textAlign: "center"
              }}>
                Informações do Usuário Logado:
              </h3>
              <div style={{ 
                display: "grid", 
                gap: "var(--spacing-sm)",
                maxWidth: "400px",
                margin: "0 auto"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--spacing-sm)",
                  backgroundColor: "var(--background-color)",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color)"
                }}>
                  <strong style={{ fontSize: "var(--font-size-medium)" }}>Nome:</strong>
                  <span style={{ fontSize: "var(--font-size-medium)" }}>{user.name}</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--spacing-sm)",
                  backgroundColor: "var(--background-color)",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color)"
                }}>
                  <strong style={{ fontSize: "var(--font-size-medium)" }}>Email:</strong>
                  <span style={{ fontSize: "var(--font-size-medium)" }}>{user.email}</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--spacing-sm)",
                  backgroundColor: "var(--background-color)",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color)"
                }}>
                  <strong style={{ fontSize: "var(--font-size-medium)" }}>Tipo:</strong>
                  <span style={{
                    backgroundColor: user.type === "admin" ? "var(--danger-color)" : "var(--success-color)",
                    color: "white",
                    padding: "var(--spacing-xs) var(--spacing-sm)",
                    borderRadius: "4px",
                    fontSize: "var(--font-size-small)",
                    fontWeight: "bold"
                  }}>
                    {user.type}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Informações sobre acessibilidade */}
          <div style={{ 
            padding: "var(--spacing-lg)", 
            backgroundColor: "var(--background-secondary)", 
            borderRadius: "8px",
            border: "1px solid var(--border-color)"
          }}>
            <h3 style={{ 
              marginBottom: "var(--spacing-sm)", 
              color: "var(--text-color)",
              fontSize: "var(--font-size-large)",
              textAlign: "center"
            }}>
              ♿ Recursos de Acessibilidade
            </h3>
            <p style={{ 
              margin: 0, 
              color: "var(--text-secondary)",
              fontSize: "var(--font-size-medium)",
              textAlign: "center",
              lineHeight: "1.6"
            }}>
              Esta aplicação inclui recursos de acessibilidade como modo escuro, controle de tamanho de fonte, 
              alto contraste e redução de movimento. Use o botão de acessibilidade no canto inferior direito 
              para personalizar sua experiência.
            </p>
          </div>
        </div>
      </div>
      <AccessibilityPanel />
    </div>
  );
}

export default Home;

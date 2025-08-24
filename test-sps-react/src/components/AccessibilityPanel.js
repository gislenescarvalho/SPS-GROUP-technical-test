import React, { useState } from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";

function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Sempre chamar o hook no topo do componente
  const accessibilityContext = useAccessibility();

  // Verificar se o contexto tem as propriedades necessárias
  if (!accessibilityContext || typeof accessibilityContext !== 'object') {
    return null;
  }

  const {
    theme,
    toggleTheme,
  } = accessibilityContext;

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botão flutuante de acessibilidade */}
      <button
        onClick={togglePanel}
        onKeyDown={handleKeyPress}
        aria-label="Abrir painel de acessibilidade"
        aria-expanded={isOpen}
        style={{
          position: "fixed",
          bottom: "var(--spacing-lg)",
          right: "var(--spacing-lg)",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "var(--primary-color)",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          zIndex: 1000,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          transition: "transform 0.2s ease",
          minHeight: "44px",
          minWidth: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
        }}
      >
        ♿
      </button>

      {/* Painel de acessibilidade */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            right: "0",
            width: "min(350px, 100vw)",
            height: "100vh",
            backgroundColor: "var(--background-color)",
            borderLeft: "2px solid var(--border-color)",
            padding: "var(--spacing-lg)",
            zIndex: 999,
            overflowY: "auto",
            boxShadow: "-4px 0 8px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease",
            boxSizing: "border-box"
          }}
        >
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "var(--spacing-xl)" 
          }}>
            <h2 style={{ 
              margin: 0, 
              color: "var(--text-color)",
              fontSize: "var(--font-size-large)"
            }}>
              Acessibilidade
            </h2>
            <button
              onClick={togglePanel}
              aria-label="Fechar painel de acessibilidade"
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "var(--text-color)",
                minHeight: "44px",
                minWidth: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ×
            </button>
          </div>

          {/* Tema */}
          <div style={{ marginBottom: "var(--spacing-xl)" }}>
            <h3 style={{ 
              marginBottom: "var(--spacing-sm)", 
              color: "var(--text-color)",
              fontSize: "var(--font-size-medium)"
            }}>
              Tema
            </h3>
            <button
              onClick={toggleTheme}
              aria-label={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
              style={{
                width: "100%",
                padding: "var(--spacing-sm)",
                backgroundColor: "var(--primary-color)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "var(--font-size-medium)",
                minHeight: "44px"
              }}
            >
              {theme === "light" ? "🌙 Modo Escuro" : "☀️ Modo Claro"}
            </button>
          </div>

          {/* Atalhos de teclado */}
          <div style={{ marginBottom: "var(--spacing-xl)" }}>
            <h3 style={{ 
              marginBottom: "var(--spacing-sm)", 
              color: "var(--text-color)",
              fontSize: "var(--font-size-medium)"
            }}>
              Atalhos de Teclado
            </h3>
            <div style={{ 
              fontSize: "var(--font-size-small)", 
              color: "var(--text-secondary)" 
            }}>
              <p style={{ margin: "var(--spacing-xs) 0" }}>• <kbd>Tab</kbd> - Navegar pelos elementos</p>
              <p style={{ margin: "var(--spacing-xs) 0" }}>• <kbd>Enter</kbd> ou <kbd>Espaço</kbd> - Ativar botões</p>
              <p style={{ margin: "var(--spacing-xs) 0" }}>• <kbd>Esc</kbd> - Fechar painel</p>
            </div>
          </div>

          {/* Informações de acessibilidade */}
          <div style={{ 
            padding: "var(--spacing-md)", 
            backgroundColor: "var(--background-secondary)", 
            borderRadius: "4px",
            border: "1px solid var(--border-color)"
          }}>
            <h4 style={{ 
              margin: "0 0 var(--spacing-sm) 0", 
              color: "var(--text-color)",
              fontSize: "var(--font-size-small)"
            }}>
              Informações
            </h4>
            <p style={{ 
              margin: 0, 
              fontSize: "var(--font-size-small)", 
              color: "var(--text-secondary)",
              lineHeight: "1.4"
            }}>
              Esta aplicação foi desenvolvida seguindo as diretrizes de acessibilidade WCAG 2.1. 
              Use os controles acima para personalizar sua experiência.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AccessibilityPanel;

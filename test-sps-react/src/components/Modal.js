import React from "react";

function Modal({ isOpen, onClose, title, children, size = "medium" }) {
  if (!isOpen) return null;

  const sizeStyles = {
    small: { maxWidth: "400px" },
    medium: { maxWidth: "500px" },
    large: { maxWidth: "700px" }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "var(--spacing-md)"
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--background-color)",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          width: "100%",
          ...sizeStyles[size],
          maxHeight: "90vh",
          overflow: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--spacing-lg)",
            borderBottom: "1px solid var(--border-color)"
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "var(--text-color)",
              fontSize: "var(--font-size-large)"
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--text-color)",
              padding: "var(--spacing-xs)",
              minHeight: "44px",
              minWidth: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "background-color 0.2s ease"
            }}
            aria-label="Fechar modal"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--background-secondary)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "var(--spacing-lg)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;


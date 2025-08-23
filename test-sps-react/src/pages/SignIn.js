import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AccessibilityPanel from "../components/AccessibilityPanel";
import FormField from "../components/FormField";
import ErrorHandler, { useErrorHandler } from "../components/ErrorHandler";
import { loginSchema, validateData } from "../validations/userValidations";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addError, ErrorList } = useErrorHandler();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Validar dados antes de enviar
    const validation = await validateData(loginSchema, { email, password });
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate("/users");
    } catch (error) {
      addError({
        title: 'Erro no Login',
        message: error.message,
        userMessage: error.userMessage || error.message,
        details: {
          email: email,
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "var(--background-color)",
      padding: "var(--spacing-lg)"
    }}>
      <div style={{
        backgroundColor: "var(--background-color)",
        padding: "var(--spacing-xl)",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px",
        border: "1px solid var(--border-color)"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          marginBottom: "var(--spacing-xl)", 
          color: "var(--text-color)",
          fontSize: "var(--font-size-xlarge)"
        }}>
          Login
        </h1>
        
        <ErrorList variant="error" showDetails={false} />

        <form onSubmit={handleSubmit}>
          <FormField
            label="Campo de email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={validationErrors.email}
            required
            placeholder="admin@spsgroup.com.br"
          />

          <FormField
            label="Campo de senha"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={validationErrors.password}
            required
            placeholder="1234"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "var(--spacing-md)",
              backgroundColor: loading ? "var(--disabled-color)" : "var(--primary-color)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "var(--font-size-medium)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s ease",
              minHeight: "44px",
              marginBottom: "var(--spacing-lg)"
            }}
            aria-label={loading ? "Fazendo login..." : "Fazer login"}
          >
            {loading ? "Fazendo login..." : "Entrar"}
          </button>
        </form>

        <div style={{ 
          marginBottom: "var(--spacing-xl)", 
          textAlign: "center", 
          fontSize: "var(--font-size-small)", 
          color: "var(--text-secondary)",
          padding: "var(--spacing-md)",
          backgroundColor: "var(--background-secondary)",
          borderRadius: "4px",
          border: "1px solid var(--border-color)"
        }}>
          <p style={{ margin: "var(--spacing-xs) 0", fontWeight: "bold" }}>Usuário padrão:</p>
          <p style={{ margin: "var(--spacing-xs) 0" }}>Email: admin@spsgroup.com.br</p>
          <p style={{ margin: "var(--spacing-xs) 0" }}>Senha: 1234</p>
        </div>

        {/* Informações sobre acessibilidade */}
        <div style={{ 
          padding: "var(--spacing-md)", 
          backgroundColor: "var(--background-secondary)", 
          borderRadius: "4px",
          border: "1px solid var(--border-color)"
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: "var(--font-size-small)", 
            color: "var(--text-secondary)",
            textAlign: "center",
            lineHeight: "1.4"
          }}>
            ♿ Use o botão de acessibilidade no canto inferior direito para personalizar sua experiência.
          </p>
        </div>
      </div>
      <AccessibilityPanel />
    </div>
  );
}

export default SignIn;

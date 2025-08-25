import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData } from "react-router-dom";
import UserService from "../services/UserService";
import Navbar from "../components/Navbar";
import AccessibilityPanel from "../components/AccessibilityPanel";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import LoaderInline from "../components/LoaderInline";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import { updateUserSchema, validateData } from "../validations/userValidations";

export async function userLoader({ params }) {
  try {
    if (!params.userId) {
      throw new Error("ID do usuário não fornecido");
    }
    
    const user = await UserService.get(params.userId);
    
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    
    return { user };
  } catch (error) {
    console.error("Erro no userLoader:", error);
    throw new Error("Erro ao carregar usuário");
  }
}

function UserEdit() {
  let initialUser;
  let loaderError;
  
  try {
    const loaderData = useLoaderData();
    initialUser = loaderData?.user;
  } catch (error) {
    console.error('Erro ao carregar dados do loader:', error);
    loaderError = error;
  }

  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    ...initialUser,
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");

  // Verificar se houve mudanças - sempre executar este useEffect
  useEffect(() => {
    if (!initialUser || !user) return;
    
    const originalData = JSON.stringify({
      name: initialUser.name,
      email: initialUser.email,
      type: initialUser.type
    });
    const currentData = JSON.stringify({
      name: user.name,
      email: user.email,
      type: user.type
    });
    const hasPasswordChanges = user.password && user.password.length > 0;
    const hasChangesValue = originalData !== currentData || hasPasswordChanges;
    setHasChanges(hasChangesValue);
  }, [user, initialUser]);

  // Verificar se houve erro no loader ou se o usuário inicial foi carregado corretamente
  if (loaderError || !initialUser) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "var(--font-size-large)",
        color: "var(--text-color)"
      }}>
        {loaderError ? "Erro ao carregar usuário" : "Carregando usuário..."}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) {
      navigate("/users");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    console.log('🔍 confirmUpdate chamado');
    setLoading(true);
    setError("");
    setValidationErrors({});

    try {
      // Verificar se as senhas coincidem (apenas se estiver alterando a senha)
      if (user.password && user.password.length > 0 && !passwordMatch) {
        setPasswordMatchMessage("As senhas não coincidem. Por favor, corrija antes de continuar.");
        setLoading(false);
        return;
      }
      
      // Validar dados antes de enviar
      const { id, confirmPassword, ...updateData } = user;
      
      // Se não há senha, remover o campo password do updateData
      if (!updateData.password || updateData.password.length === 0) {
        delete updateData.password;
      }
      
      console.log('🔍 Dados para atualização:', { userId, updateData });
      
      const validation = await validateData(updateUserSchema, user);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setLoading(false);
        return;
      }

      console.log('🔍 Chamando UserService.update...');
      await UserService.update(userId, updateData);
      console.log('✅ Update realizado com sucesso');
      setShowConfirmModal(false);
      setModalMessage("Usuário atualizado com sucesso!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ Erro no confirmUpdate:', error);
      setModalMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se as senhas coincidem
  const checkPasswordMatch = (password, confirmPassword) => {
    // Se não há senha sendo alterada, não precisa verificar
    if (!password || password.length === 0) {
      setPasswordMatch(true);
      setPasswordMatchMessage("");
      return;
    }
    
    if (!confirmPassword || confirmPassword.length === 0) {
      setPasswordMatch(true);
      setPasswordMatchMessage("");
      return;
    }
    
    if (password === confirmPassword) {
      setPasswordMatch(true);
      setPasswordMatchMessage("Senhas coincidem!");
    } else {
      setPasswordMatch(false);
      setPasswordMatchMessage("As senhas não coincidem. Por favor, verifique.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Verificar senhas se estiver alterando campos de senha
    if (name === 'password') {
      checkPasswordMatch(value, user.confirmPassword);
    } else if (name === 'confirmPassword') {
      checkPasswordMatch(user.password, value);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: "var(--spacing-xl) var(--spacing-xl)" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "var(--spacing-xl)",
          flexWrap: "wrap",
          gap: "var(--spacing-md)"
        }}>
          <h1 style={{ 
            color: "var(--text-color)",
            fontSize: "var(--font-size-xlarge)",
            margin: 0
          }}>
            Editar Usuário
          </h1>
          <button
            onClick={() => navigate("/users")}
            style={{
              backgroundColor: "var(--secondary-color)",
              color: "white",
              border: "none",
              padding: "var(--spacing-sm) var(--spacing-md)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "var(--font-size-medium)",
              transition: "background-color 0.3s ease",
              minHeight: "44px",
              whiteSpace: "nowrap"
            }}
            aria-label="Voltar para lista de usuários"
          >
            Voltar
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: "var(--danger-color)",
            color: "white",
            padding: "var(--spacing-md)",
            borderRadius: "4px",
            marginBottom: "var(--spacing-md)",
            fontSize: "var(--font-size-medium)"
          }}>
            {error}
          </div>
        )}

        <div style={{
          backgroundColor: "var(--background-color)",
          padding: "var(--spacing-xl)",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid var(--border-color)",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          <form onSubmit={handleSubmit}>
            <FormField
              label="ID"
              type="text"
              name="id"
              value={user.id}
              disabled
              error={validationErrors.id}
            />

            <FormField
              label="Nome"
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              error={validationErrors.name}
              required
              minLength={2}
              maxLength={100}
              placeholder="Digite o nome completo"
            />

            <FormField
              label="Email"
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              error={validationErrors.email}
              required
              maxLength={255}
              placeholder="exemplo@email.com"
            />

            <FormField
              label="Tipo"
              type="select"
              name="type"
              value={user.type}
              onChange={handleChange}
              error={validationErrors.type}
              required
              options={[
                { value: "user", label: "Usuário" },
                { value: "admin", label: "Administrador" }
              ]}
            />

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: "var(--spacing-lg)", 
              marginBottom: "var(--spacing-lg)" 
            }}>
              <FormField
                label="Nova Senha (opcional)"
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                error={validationErrors.password}
                minLength={8}
                maxLength={50}
                placeholder="Deixe em branco para manter a senha atual"
              />
              <FormField
                label="Confirmar Nova Senha"
                type="password"
                name="confirmPassword"
                value={user.confirmPassword}
                onChange={handleChange}
                error={validationErrors.confirmPassword}
                minLength={8}
                maxLength={50}
                placeholder="Digite a nova senha novamente"
              />
            </div>
            
            {user.password && user.password.length > 0 && (
              <div style={{
                marginBottom: "var(--spacing-lg)",
                padding: "var(--spacing-md)",         
              }}>
                <PasswordStrengthIndicator password={user.password} />
              </div>
            )}
            
            {/* Mensagem de validação de senha */}
            {passwordMatchMessage && (
              <div style={{
                marginBottom: "var(--spacing-lg)",
                padding: "var(--spacing-md)",
                borderRadius: "4px",
                backgroundColor: passwordMatch ? "var(--success-color)" : "var(--danger-color)",
                color: "white",
                fontSize: "var(--font-size-medium)",
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-sm)",
                border: `1px solid ${passwordMatch ? "var(--success-color)" : "var(--danger-color)"}`,
                boxShadow: `0 2px 4px rgba(${passwordMatch ? "40, 167, 69" : "220, 53, 69"}, 0.2)`
              }}>
                <span style={{ fontSize: "var(--font-size-large)" }}>
                  {passwordMatch ? "✅" : "❌"}
                </span>
                <span>{passwordMatchMessage}</span>
              </div>
            )}

            <div style={{ 
              display: "grid", 
              gap: "var(--spacing-md)",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
            }}>
              <button
                type="submit"
                disabled={loading || !hasChanges || (user.password && user.password.length > 0 && !passwordMatch)}
                style={{
                  backgroundColor: loading || !hasChanges || (user.password && user.password.length > 0 && !passwordMatch) ? "var(--disabled-color)" : "var(--primary-color)",
                  color: "white",
                  border: "none",
                  padding: "var(--spacing-md)",
                  borderRadius: "4px",
                  fontSize: "var(--font-size-medium)",
                  cursor: loading || !hasChanges || (user.password && user.password.length > 0 && !passwordMatch) ? "not-allowed" : "pointer",
                  transition: "background-color 0.3s ease",
                  minHeight: "44px"
                }}
                aria-label={loading ? "Salvando alterações..." : !hasChanges ? "Nenhuma alteração para salvar" : (user.password && user.password.length > 0 && !passwordMatch) ? "Senhas não coincidem" : "Salvar alterações"}
              >
                {loading ? <LoaderInline text="Salvando..." /> : !hasChanges ? "Nenhuma Alteração" : (user.password && user.password.length > 0 && !passwordMatch) ? "Senhas Não Coincidem" : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/users")}
                style={{
                  backgroundColor: "var(--secondary-color)",
                  color: "white",
                  border: "none",
                  padding: "var(--spacing-md)",
                  borderRadius: "4px",
                  fontSize: "var(--font-size-medium)",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  minHeight: "44px"
                }}
                aria-label="Cancelar edição e voltar"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
      <AccessibilityPanel />

      {/* Modal de confirmação de edição */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Alterações"
        size="small"
      >
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "var(--spacing-md)",
            opacity: 0.7
          }}>
            ✏️
          </div>
          <p style={{
            fontSize: "var(--font-size-medium)",
            color: "var(--text-color)",
            marginBottom: "var(--spacing-lg)",
            lineHeight: "1.5"
          }}>
            Tem certeza que deseja salvar as alterações no usuário <strong>{user.name}</strong>?
          </p>
          <div style={{
            display: "flex",
            gap: "var(--spacing-md)",
            justifyContent: "center"
          }}>
            <button
              onClick={() => setShowConfirmModal(false)}
              style={{
                backgroundColor: "var(--secondary-color)",
                color: "white",
                border: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "var(--font-size-medium)",
                transition: "background-color 0.3s ease",
                minHeight: "44px"
              }}
              aria-label="Cancelar alterações"
            >
              Cancelar
            </button>
            <button
              onClick={confirmUpdate}
              disabled={loading || (user.password && user.password.length > 0 && !passwordMatch)}
              style={{
                backgroundColor: loading || (user.password && user.password.length > 0 && !passwordMatch) ? "var(--disabled-color)" : "var(--primary-color)",
                color: "white",
                border: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                cursor: loading || (user.password && user.password.length > 0 && !passwordMatch) ? "not-allowed" : "pointer",
                fontSize: "var(--font-size-medium)",
                transition: "background-color 0.3s ease",
                minHeight: "44px"
              }}
              aria-label={loading ? "Salvando..." : (user.password && user.password.length > 0 && !passwordMatch) ? "Senhas não coincidem" : "Confirmar alterações"}
            >
              {loading ? <LoaderInline text="Salvando..." /> : (user.password && user.password.length > 0 && !passwordMatch) ? "Senhas Não Coincidem" : "Confirmar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de sucesso */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/users");
        }}
        title="Sucesso"
        size="small"
      >
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "var(--spacing-md)",
            opacity: 0.7
          }}>
            ✅
          </div>
          <p style={{
            fontSize: "var(--font-size-medium)",
            color: "var(--text-color)",
            marginBottom: "var(--spacing-lg)",
            lineHeight: "1.5"
          }}>
            {modalMessage}
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center"
          }}>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/users");
              }}
              style={{
                backgroundColor: "var(--success-color)",
                color: "white",
                border: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "var(--font-size-medium)",
                transition: "background-color 0.3s ease",
                minHeight: "44px"
              }}
              aria-label="Fechar mensagem de sucesso e voltar"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de erro */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Erro"
        size="small"
      >
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "var(--spacing-md)",
            opacity: 0.7
          }}>
            ❌
          </div>
          <p style={{
            fontSize: "var(--font-size-medium)",
            color: "var(--text-color)",
            marginBottom: "var(--spacing-lg)",
            lineHeight: "1.5"
          }}>
            {modalMessage}
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center"
          }}>
            <button
              onClick={() => setShowErrorModal(false)}
              style={{
                backgroundColor: "var(--danger-color)",
                color: "white",
                border: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "var(--font-size-medium)",
                transition: "background-color 0.3s ease",
                minHeight: "44px"
              }}
              aria-label="Fechar mensagem de erro"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UserEdit;

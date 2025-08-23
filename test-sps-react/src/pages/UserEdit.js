import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData } from "react-router-dom";
import UserService from "../services/UserService";
import Navbar from "../components/Navbar";
import AccessibilityPanel from "../components/AccessibilityPanel";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { updateUserSchema, validateData } from "../validations/userValidations";

export async function userLoader({ params }) {
  try {
    const user = await UserService.get(params.userId);
    return { user };
  } catch (error) {
    throw new Error("Erro ao carregar usuário");
  }
}

function UserEdit() {
  const { user: initialUser } = useLoaderData();
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Verificar se houve mudanças
  useEffect(() => {
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
    setHasChanges(originalData !== currentData);
  }, [user, initialUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) {
      navigate("/users");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    setLoading(true);
    setError("");
    setValidationErrors({});

    try {
      // Validar dados antes de enviar
      const { id, ...updateData } = user;
      const validation = await validateData(updateUserSchema, updateData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Verificar email duplicado
      const emailExists = await UserService.checkEmailExists(updateData.email, userId);
      if (emailExists) {
        setValidationErrors({ email: 'Este email já está em uso por outro usuário' });
        setLoading(false);
        return;
      }

      await UserService.update(userId, updateData);
      setShowConfirmModal(false);
      setModalMessage("Usuário atualizado com sucesso!");
      setShowSuccessModal(true);
    } catch (error) {
      setModalMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: "var(--spacing-xl) 0" }}>
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
              gap: "var(--spacing-md)",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
            }}>
              <button
                type="submit"
                disabled={loading || !hasChanges}
                style={{
                  backgroundColor: loading || !hasChanges ? "var(--disabled-color)" : "var(--primary-color)",
                  color: "white",
                  border: "none",
                  padding: "var(--spacing-md)",
                  borderRadius: "4px",
                  fontSize: "var(--font-size-medium)",
                  cursor: loading || !hasChanges ? "not-allowed" : "pointer",
                  transition: "background-color 0.3s ease",
                  minHeight: "44px"
                }}
                aria-label={loading ? "Salvando alterações..." : !hasChanges ? "Nenhuma alteração para salvar" : "Salvar alterações"}
              >
                {loading ? "Salvando..." : !hasChanges ? "Nenhuma Alteração" : "Salvar"}
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
              disabled={loading}
              style={{
                backgroundColor: loading ? "var(--disabled-color)" : "var(--primary-color)",
                color: "white",
                border: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "var(--font-size-medium)",
                transition: "background-color 0.3s ease",
                minHeight: "44px"
              }}
              aria-label={loading ? "Salvando..." : "Confirmar alterações"}
            >
              {loading ? "Salvando..." : "Confirmar"}
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

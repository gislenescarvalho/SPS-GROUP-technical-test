import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useToastContext } from "../contexts/ToastContext";
import UserService from "../services/UserService";
import useApi from "../hooks/useApi";
import Navbar from "../components/Navbar";
import AccessibilityPanel from "../components/AccessibilityPanel";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import Loader from "../components/Loader";
import LoaderInline from "../components/LoaderInline";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import { createUserSchema, validateData } from "../validations/userValidations";

function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    type: "user",
    password: "",
    confirmPassword: ""
  });
  const [creating, setCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  
  // Estados para modais de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  // Ref para controlar requisições em andamento
  const loadingRef = useRef(false);

  // Hook para gerenciar chamadas da API
  const { loading, error, execute, clearError } = useApi((params) => UserService.list(params));
  const { showSuccess, showError } = useToastContext();

  const loadUsers = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (loadingRef.current) {
      console.log('Requisição já em andamento, ignorando...');
      return;
    }

    try {
      loadingRef.current = true;
      clearError();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      };
      
      console.log('Carregando usuários com params:', params);
      const data = await execute(params);
      
      // Atualizar estado com dados da paginação
      setUsers(data.users || data);
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      loadingRef.current = false;
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Função para verificar se as senhas coincidem
  const checkPasswordMatch = (password, confirmPassword) => {
    if (!password || !confirmPassword) {
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Verificar se as senhas coincidem
    if (!passwordMatch) {
      setPasswordMatchMessage("As senhas não coincidem. Por favor, corrija antes de continuar.");
      return;
    }
    
    // Validar dados antes de enviar
    const validation = await validateData(createUserSchema, newUser);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Verificar email duplicado
    const emailExists = await UserService.checkEmailExists(newUser.email);
    if (emailExists) {
      setValidationErrors({ email: 'Este email já está em uso por outro usuário' });
      return;
    }

    setCreating(true);
    setValidationErrors({});
    
    try {
      await UserService.create(newUser);
      setNewUser({ name: "", email: "", type: "user", password: "", confirmPassword: "" });
      setShowCreateForm(false);
      setValidationErrors({});
      setPasswordMatch(true);
      setPasswordMatchMessage("");
      showSuccess("Usuário criado com sucesso!");
      loadUsers();
    } catch (error) {
      showError(error.message || "Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await UserService.delete(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      setModalMessage("Usuário excluído com sucesso!");
      setShowSuccessModal(true);
      loadUsers();
    } catch (error) {
      setModalMessage(error.message);
      setShowErrorModal(true);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <Loader text="Carregando usuários..." height="calc(100vh - 80px)" />
        <AccessibilityPanel />
      </div>
    );
  }

  // Estado de lista vazia
  if (users.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ 
          padding: "var(--spacing-xl) var(--spacing-xl)",
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{ 
            textAlign: "center", 
            padding: "var(--spacing-xxl)",
            color: "var(--text-secondary)",
            backgroundColor: "var(--background-color)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "500px",
            width: "100%"
          }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "var(--spacing-lg)",
              opacity: 0.5
            }}>
              👥
            </div>
            <h2 style={{
              color: "var(--text-color)",
              fontSize: "var(--font-size-xlarge)",
              marginBottom: "var(--spacing-md)"
            }}>
              Nenhum usuário encontrado
            </h2>
            <p style={{
              fontSize: "var(--font-size-large)",
              marginBottom: "var(--spacing-xl)",
              maxWidth: "500px",
              margin: "0 auto var(--spacing-xl) auto",
              lineHeight: "1.6"
            }}>
              Comece criando o primeiro usuário do sistema para gerenciar sua equipe.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
                border: "none",
                padding: "var(--spacing-md) var(--spacing-xl)",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "var(--font-size-large)",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                minHeight: "50px",
                boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--info-color)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 123, 255, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--primary-color)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(0, 123, 255, 0.3)";
              }}
              aria-label="Criar primeiro usuário"
            >
              ✨ Criar Primeiro Usuário
            </button>
          </div>
        </div>
        <AccessibilityPanel />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ 
        padding: "var(--spacing-xl) var(--spacing-xl)",
        minHeight: "calc(100vh - 80px)"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "var(--spacing-xl)",
          flexWrap: "wrap",
          gap: "var(--spacing-md)",
          padding: "0 var(--spacing-sm)"
        }}>
          <h1 style={{ 
            color: "var(--text-color)",
            fontSize: "var(--font-size-xlarge)",
            margin: 0,
            flex: "1 1 auto"
          }}>
            Gerenciamento de Usuários
          </h1>
          <button
            onClick={() => {
              if (showCreateForm) {
                // Limpar formulário ao cancelar
                setNewUser({ name: "", email: "", type: "user", password: "", confirmPassword: "" });
                setValidationErrors({});
                setPasswordMatch(true);
                setPasswordMatchMessage("");
              }
              setShowCreateForm(!showCreateForm);
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
              minHeight: "44px",
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
            aria-label={showCreateForm ? "Cancelar criação de usuário" : "Criar novo usuário"}
          >
            {showCreateForm ? "Cancelar" : "Novo Usuário"}
          </button>
        </div>

        {/* Controles de busca e paginação */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--spacing-lg)",
          flexWrap: "wrap",
          gap: "var(--spacing-md)",
          padding: "var(--spacing-lg)",
          backgroundColor: "var(--background-secondary)",
          borderRadius: "8px",
          border: "1px solid var(--border-color)"
        }}>
          {/* Busca */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)"
          }}>
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "var(--spacing-sm) var(--spacing-md)",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                fontSize: "var(--font-size-medium)",
                minWidth: "250px",
                backgroundColor: "var(--background-color)"
              }}
              aria-label="Campo de busca de usuários"
            />
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
                border: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "var(--font-size-medium)",
                minHeight: "44px",
                minWidth: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              aria-label="Buscar usuários"
            >
              🔍
            </button>
          </div>

          {/* Informações de paginação */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-md)",
            fontSize: "var(--font-size-small)",
            color: "var(--text-secondary)",
            padding: "var(--spacing-sm) var(--spacing-md)",
            backgroundColor: "var(--background-color)",
            borderRadius: "4px",
            border: "1px solid var(--border-color)"
          }}>
            <span>
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuários
            </span>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: "var(--danger-color)",
            color: "white",
            padding: "var(--spacing-md) var(--spacing-lg)",
            borderRadius: "8px",
            marginBottom: "var(--spacing-lg)",
            fontSize: "var(--font-size-medium)",
            border: "1px solid var(--danger-color)",
            boxShadow: "0 2px 4px rgba(220, 53, 69, 0.2)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)"
            }}>
              <span style={{ fontSize: "var(--font-size-large)" }}>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {showCreateForm && (
          <div style={{
            backgroundColor: "var(--background-secondary)",
            padding: "var(--spacing-xl)",
            borderRadius: "8px",
            marginBottom: "var(--spacing-xl)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              marginBottom: "var(--spacing-lg)",
              color: "var(--text-color)",
              fontSize: "var(--font-size-large)",
              borderBottom: "2px solid var(--primary-color)",
              paddingBottom: "var(--spacing-sm)"
            }}>
              Novo Usuário
            </h3>
            <form onSubmit={handleCreateUser}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "var(--spacing-lg)", 
                marginBottom: "var(--spacing-lg)" 
              }}>
                <FormField
                  label="Nome"
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
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
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  error={validationErrors.email}
                  required
                  maxLength={255}
                  placeholder="exemplo@email.com"
                />
              </div>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "var(--spacing-lg)", 
                marginBottom: "var(--spacing-lg)" 
              }}>
                <FormField
                  label="Tipo"
                  type="select"
                  name="type"
                  value={newUser.type}
                  onChange={(e) => setNewUser({ ...newUser, type: e.target.value })}
                  error={validationErrors.type}
                  required
                  options={[
                    { value: "user", label: "Usuário" },
                    { value: "admin", label: "Administrador" }
                  ]}
                />
                <FormField
                  label="Senha"
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setNewUser({ ...newUser, password: newPassword });
                    checkPasswordMatch(newPassword, newUser.confirmPassword);
                  }}
                  error={validationErrors.password}
                  required
                  minLength={8}
                  maxLength={50}
                  placeholder="Mínimo 8 caracteres"
                />
                <FormField
                  label="Confirmar Senha"
                  type="password"
                  name="confirmPassword"
                  value={newUser.confirmPassword}
                  onChange={(e) => {
                    const newConfirmPassword = e.target.value;
                    setNewUser({ ...newUser, confirmPassword: newConfirmPassword });
                    checkPasswordMatch(newUser.password, newConfirmPassword);
                  }}
                  error={validationErrors.confirmPassword}
                  required
                  minLength={8}
                  maxLength={50}
                  placeholder="Digite a senha novamente"
                />
              </div>
              
              <div style={{
                marginBottom: "var(--spacing-lg)",
                padding: "var(--spacing-md)",         
              }}>
                <PasswordStrengthIndicator password={newUser.password} />
              </div>
              
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
                display: "flex",
                gap: "var(--spacing-md)",
                justifyContent: "flex-end",
                paddingTop: "var(--spacing-md)",
                borderTop: "1px solid var(--border-color)"
              }}>
                <button
                  type="submit"
                  disabled={creating || !passwordMatch}
                  style={{
                    backgroundColor: creating || !passwordMatch ? "var(--disabled-color)" : "var(--primary-color)",
                    color: "white",
                    border: "none",
                    padding: "var(--spacing-sm) var(--spacing-md)",
                    borderRadius: "4px",
                    cursor: creating || !passwordMatch ? "not-allowed" : "pointer",
                    fontSize: "var(--font-size-medium)",
                    transition: "background-color 0.3s ease",
                    minHeight: "44px"
                  }}
                  aria-label={creating ? "Criando usuário..." : !passwordMatch ? "Senhas não coincidem" : "Criar usuário"}
                >
                  {creating ? <LoaderInline text="Criando..." /> : !passwordMatch ? "Senhas Não Coincidem" : "Criar usuário"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{
          backgroundColor: "var(--background-color)",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          overflow: "hidden",
          border: "1px solid var(--border-color)",
          padding: "var(--spacing-lg)"
        }}>
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--background-secondary)" }}>
                  <th style={{ 
                    padding: "var(--spacing-md) var(--spacing-lg)", 
                    textAlign: "left", 
                    borderBottom: "1px solid var(--border-color)",
                    color: "var(--text-color)",
                    fontSize: "var(--font-size-medium)",
                    whiteSpace: "nowrap"
                  }}>
                    ID
                  </th>
                  <th style={{ 
                    padding: "var(--spacing-md) var(--spacing-lg)", 
                    textAlign: "left", 
                    borderBottom: "1px solid var(--border-color)",
                    color: "var(--text-color)",
                    fontSize: "var(--font-size-medium)"
                  }}>
                    Nome
                  </th>
                  <th style={{ 
                    padding: "var(--spacing-md) var(--spacing-lg)", 
                    textAlign: "left", 
                    borderBottom: "1px solid var(--border-color)",
                    color: "var(--text-color)",
                    fontSize: "var(--font-size-medium)"
                  }}>
                    Email
                  </th>
                  <th style={{ 
                    padding: "var(--spacing-md) var(--spacing-lg)", 
                    textAlign: "left", 
                    borderBottom: "1px solid var(--border-color)",
                    color: "var(--text-color)",
                    fontSize: "var(--font-size-medium)",
                    whiteSpace: "nowrap"
                  }}>
                    Tipo
                  </th>
                  <th style={{ 
                    padding: "var(--spacing-md) var(--spacing-lg)", 
                    textAlign: "left", 
                    borderBottom: "1px solid var(--border-color)",
                    color: "var(--text-color)",
                    fontSize: "var(--font-size-medium)",
                    whiteSpace: "nowrap"
                  }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ 
                      padding: "var(--spacing-md) var(--spacing-lg)",
                      color: "var(--text-color)",
                      fontSize: "var(--font-size-medium)",
                      whiteSpace: "nowrap"
                    }}>
                      {user.id}
                    </td>
                    <td style={{ 
                      padding: "var(--spacing-md) var(--spacing-lg)",
                      color: "var(--text-color)",
                      fontSize: "var(--font-size-medium)"
                    }}>
                      {user.name}
                    </td>
                    <td style={{ 
                      padding: "var(--spacing-md) var(--spacing-lg)",
                      color: "var(--text-color)",
                      fontSize: "var(--font-size-medium)"
                    }}>
                      {user.email}
                    </td>
                    <td style={{ padding: "var(--spacing-md) var(--spacing-lg)" }}>
                      <span style={{
                        backgroundColor: user.type === "admin" ? "var(--danger-color)" : "var(--success-color)",
                        color: "white",
                        padding: "var(--spacing-xs) var(--spacing-sm)",
                        borderRadius: "4px",
                        fontSize: "var(--font-size-small)",
                        whiteSpace: "nowrap"
                      }}>
                        {user.type}
                      </span>
                    </td>
                    <td style={{ 
                      padding: "var(--spacing-md) var(--spacing-lg)",
                      whiteSpace: "nowrap"
                    }}>
                      <div style={{
                        display: "flex",
                        gap: "var(--spacing-sm)",
                        flexWrap: "wrap"
                      }}>
                        <Link
                          to={`/users/${user.id}`}
                          style={{
                            backgroundColor: "var(--primary-color)",
                            color: "white",
                            textDecoration: "none",
                            padding: "var(--spacing-xs) var(--spacing-sm)",
                            borderRadius: "4px",
                            fontSize: "var(--font-size-small)",
                            transition: "background-color 0.3s ease",
                            minHeight: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          aria-label={`Editar usuário ${user.name}`}
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => confirmDelete(user)}
                          disabled={user.id === 1} // Não permitir deletar o admin principal
                          style={{
                            backgroundColor: user.id === 1 ? "var(--disabled-color)" : "var(--danger-color)",
                            color: "white",
                            border: "none",
                            padding: "var(--spacing-xs) var(--spacing-sm)",
                            borderRadius: "4px",
                            cursor: user.id === 1 ? "not-allowed" : "pointer",
                            fontSize: "var(--font-size-small)",
                            transition: "background-color 0.3s ease",
                            minHeight: "32px",
                            minWidth: "60px"
                          }}
                          aria-label={user.id === 1 ? "Não é possível excluir o administrador principal" : `Excluir usuário ${user.name}`}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Controles de paginação */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "var(--spacing-sm)",
            marginTop: "var(--spacing-lg)",
            padding: "var(--spacing-lg)",
            backgroundColor: "var(--background-secondary)",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              style={{
                backgroundColor: pagination.page === 1 ? "var(--disabled-color)" : "var(--primary-color)",
                color: "white",
                border: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                fontSize: "var(--font-size-medium)",
                transition: "background-color 0.3s ease",
                minHeight: "44px"
              }}
              aria-label="Página anterior"
            >
              ← Anterior
            </button>

            <div style={{
              display: "flex",
              gap: "var(--spacing-xs)",
              padding: "0 var(--spacing-md)"
            }}>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    style={{
                      backgroundColor: pagination.page === pageNum ? "var(--primary-color)" : "var(--background-color)",
                      color: pagination.page === pageNum ? "white" : "var(--text-color)",
                      border: "1px solid var(--border-color)",
                      padding: "var(--spacing-sm) var(--spacing-md)",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "var(--font-size-small)",
                      minWidth: "44px",
                      minHeight: "44px",
                      transition: "all 0.3s ease"
                    }}
                    aria-label={`Página ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              style={{
                backgroundColor: pagination.page === pagination.totalPages ? "var(--disabled-color)" : "var(--primary-color)",
                color: "white",
                border: "none",
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "4px",
                cursor: pagination.page === pagination.totalPages ? "not-allowed" : "pointer",
                fontSize: "var(--font-size-medium)",
                transition: "background-color 0.3s ease",
                minHeight: "44px"
              }}
              aria-label="Próxima página"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
      <AccessibilityPanel />

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
        size="small"
      >
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "var(--spacing-md)",
            opacity: 0.7
          }}>
            ⚠️
          </div>
          <p style={{
            fontSize: "var(--font-size-medium)",
            color: "var(--text-color)",
            marginBottom: "var(--spacing-lg)",
            lineHeight: "1.5"
          }}>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
          </p>
          <p style={{
            fontSize: "var(--font-size-small)",
            color: "var(--text-secondary)",
            marginBottom: "var(--spacing-lg)"
          }}>
            Esta ação não pode ser desfeita.
          </p>
          <div style={{
            display: "flex",
            gap: "var(--spacing-md)",
            justifyContent: "center"
          }}>
            <button
              onClick={() => setShowDeleteModal(false)}
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
              aria-label="Cancelar exclusão"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteUser}
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
              aria-label="Confirmar exclusão"
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de sucesso */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
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
              onClick={() => setShowSuccessModal(false)}
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
              aria-label="Fechar mensagem de sucesso"
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

export default Users;

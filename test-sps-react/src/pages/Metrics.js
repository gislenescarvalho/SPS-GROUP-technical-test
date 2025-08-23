import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import MetricsService from "../services/MetricsService";
import useApi from "../hooks/useApi";
import Navbar from "../components/Navbar";
import AccessibilityPanel from "../components/AccessibilityPanel";

function Metrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  
  const { loading, error, execute, clearError } = useApi();

  useEffect(() => {
    loadMetrics();
  }, [activeTab]);

  const loadMetrics = async () => {
    try {
      clearError();
      let data;
      
      switch (activeTab) {
        case 'performance':
          data = await execute(MetricsService.getPerformanceMetrics);
          break;
        case 'users':
          data = await execute(MetricsService.getUserMetrics);
          break;
        case 'auth':
          data = await execute(MetricsService.getAuthMetrics);
          break;
        case 'cache':
          data = await execute(MetricsService.getCacheMetrics);
          break;
        default:
          data = await execute(MetricsService.getMetrics);
          break;
      }
      
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, color = "var(--primary-color)" }) => (
    <div style={{
      backgroundColor: "var(--background-color)",
      padding: "var(--spacing-lg)",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      border: "1px solid var(--border-color)",
      flex: "1",
      minWidth: "200px"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "var(--spacing-md)"
      }}>
        <div style={{
          fontSize: "24px",
          color: color
        }}>
          {icon}
        </div>
        <h3 style={{
          margin: 0,
          fontSize: "var(--font-size-large)",
          color: "var(--text-color)"
        }}>
          {title}
        </h3>
      </div>
      <div style={{
        fontSize: "32px",
        fontWeight: "bold",
        color: "var(--text-color)",
        marginBottom: "var(--spacing-sm)"
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{
          fontSize: "var(--font-size-small)",
          color: "var(--text-secondary)"
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        backgroundColor: activeTab === id ? "var(--primary-color)" : "transparent",
        color: activeTab === id ? "white" : "var(--text-color)",
        border: "none",
        padding: "var(--spacing-sm) var(--spacing-md)",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "var(--font-size-medium)",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-sm)"
      }}
      aria-label={`Abrir métricas de ${label}`}
    >
      {icon} {label}
    </button>
  );

  if (!user || user.type !== 'admin') {
    return (
      <div>
        <Navbar />
        <div style={{
          textAlign: "center",
          padding: "var(--spacing-xxl)",
          color: "var(--text-secondary)"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "var(--spacing-lg)" }}>
            🔒
          </div>
          <h2>Acesso Negado</h2>
          <p>Apenas administradores podem acessar as métricas do sistema.</p>
        </div>
        <AccessibilityPanel />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: "var(--spacing-xl) 0" }}>
        <h1 style={{
          color: "var(--text-color)",
          fontSize: "var(--font-size-xlarge)",
          marginBottom: "var(--spacing-xl)"
        }}>
          Métricas do Sistema
        </h1>

        {/* Tabs de navegação */}
        <div style={{
          display: "flex",
          gap: "var(--spacing-sm)",
          marginBottom: "var(--spacing-xl)",
          flexWrap: "wrap"
        }}>
          <TabButton id="general" label="Geral" icon="📊" />
          <TabButton id="performance" label="Performance" icon="⚡" />
          <TabButton id="users" label="Usuários" icon="👥" />
          <TabButton id="auth" label="Autenticação" icon="🔐" />
          <TabButton id="cache" label="Cache" icon="💾" />
        </div>

        {error && (
          <div style={{
            backgroundColor: "var(--danger-color)",
            color: "white",
            padding: "var(--spacing-md)",
            borderRadius: "4px",
            marginBottom: "var(--spacing-lg)"
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            textAlign: "center",
            padding: "var(--spacing-xxl)",
            color: "var(--text-secondary)"
          }}>
            Carregando métricas...
          </div>
        ) : metrics ? (
          <div>
            {activeTab === 'general' && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "var(--spacing-lg)"
              }}>
                <MetricCard
                  title="Total de Usuários"
                  value={metrics.totalUsers || 0}
                  subtitle="Usuários registrados"
                  icon="👥"
                  color="var(--primary-color)"
                />
                <MetricCard
                  title="Usuários Ativos"
                  value={metrics.activeUsers || 0}
                  subtitle="Usuários logados hoje"
                  icon="✅"
                  color="var(--success-color)"
                />
                <MetricCard
                  title="Logins Hoje"
                  value={metrics.loginsToday || 0}
                  subtitle="Tentativas de login"
                  icon="🔐"
                  color="var(--info-color)"
                />
                <MetricCard
                  title="Taxa de Sucesso"
                  value={`${metrics.successRate || 0}%`}
                  subtitle="Logins bem-sucedidos"
                  icon="📈"
                  color="var(--success-color)"
                />
              </div>
            )}

            {activeTab === 'performance' && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "var(--spacing-lg)"
              }}>
                <MetricCard
                  title="Tempo de Resposta"
                  value={`${metrics.avgResponseTime || 0}ms`}
                  subtitle="Média de resposta da API"
                  icon="⚡"
                  color="var(--primary-color)"
                />
                <MetricCard
                  title="Requisições/min"
                  value={metrics.requestsPerMinute || 0}
                  subtitle="Taxa de requisições"
                  icon="📊"
                  color="var(--info-color)"
                />
                <MetricCard
                  title="Erros 5xx"
                  value={metrics.serverErrors || 0}
                  subtitle="Erros do servidor"
                  icon="❌"
                  color="var(--danger-color)"
                />
                <MetricCard
                  title="Uptime"
                  value={`${metrics.uptime || 0}%`}
                  subtitle="Disponibilidade do sistema"
                  icon="🟢"
                  color="var(--success-color)"
                />
              </div>
            )}

            {activeTab === 'users' && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "var(--spacing-lg)"
              }}>
                <MetricCard
                  title="Novos Usuários"
                  value={metrics.newUsersThisWeek || 0}
                  subtitle="Esta semana"
                  icon="🆕"
                  color="var(--success-color)"
                />
                <MetricCard
                  title="Usuários por Tipo"
                  value={metrics.usersByType?.admin || 0}
                  subtitle="Administradores"
                  icon="👑"
                  color="var(--warning-color)"
                />
                <MetricCard
                  title="Usuários por Tipo"
                  value={metrics.usersByType?.user || 0}
                  subtitle="Usuários comuns"
                  icon="👤"
                  color="var(--primary-color)"
                />
                <MetricCard
                  title="Último Login"
                  value={metrics.lastLogin || 'N/A'}
                  subtitle="Usuário mais recente"
                  icon="🕐"
                  color="var(--info-color)"
                />
              </div>
            )}

            {activeTab === 'auth' && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "var(--spacing-lg)"
              }}>
                <MetricCard
                  title="Tokens Ativos"
                  value={metrics.activeTokens || 0}
                  subtitle="Sessões ativas"
                  icon="🎫"
                  color="var(--primary-color)"
                />
                <MetricCard
                  title="Logouts Hoje"
                  value={metrics.logoutsToday || 0}
                  subtitle="Sessões encerradas"
                  icon="🚪"
                  color="var(--secondary-color)"
                />
                <MetricCard
                  title="Tentativas Falhadas"
                  value={metrics.failedLogins || 0}
                  subtitle="Logins inválidos"
                  icon="🚫"
                  color="var(--danger-color)"
                />
                <MetricCard
                  title="Tokens Expirados"
                  value={metrics.expiredTokens || 0}
                  subtitle="Limpeza automática"
                  icon="🧹"
                  color="var(--warning-color)"
                />
              </div>
            )}

            {activeTab === 'cache' && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "var(--spacing-lg)"
              }}>
                <MetricCard
                  title="Hit Rate"
                  value={`${metrics.cacheHitRate || 0}%`}
                  subtitle="Taxa de acerto do cache"
                  icon="🎯"
                  color="var(--success-color)"
                />
                <MetricCard
                  title="Itens em Cache"
                  value={metrics.cachedItems || 0}
                  subtitle="Objetos armazenados"
                  icon="💾"
                  color="var(--primary-color)"
                />
                <MetricCard
                  title="Memória Usada"
                  value={`${metrics.cacheMemoryUsage || 0}MB`}
                  subtitle="Uso de memória"
                  icon="🧠"
                  color="var(--info-color)"
                />
                <MetricCard
                  title="Expirações"
                  value={metrics.cacheExpirations || 0}
                  subtitle="Itens expirados"
                  icon="⏰"
                  color="var(--warning-color)"
                />
              </div>
            )}

            {/* Detalhes adicionais */}
            {metrics.details && (
              <div style={{
                marginTop: "var(--spacing-xl)",
                backgroundColor: "var(--background-secondary)",
                padding: "var(--spacing-lg)",
                borderRadius: "8px",
                border: "1px solid var(--border-color)"
              }}>
                <h3 style={{
                  marginBottom: "var(--spacing-md)",
                  color: "var(--text-color)"
                }}>
                  Detalhes Técnicos
                </h3>
                <pre style={{
                  backgroundColor: "var(--background-color)",
                  padding: "var(--spacing-md)",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "var(--font-size-small)",
                  color: "var(--text-color)"
                }}>
                  {JSON.stringify(metrics.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "var(--spacing-xxl)",
            color: "var(--text-secondary)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "var(--spacing-lg)" }}>
              📊
            </div>
            <h2>Nenhuma métrica disponível</h2>
            <p>As métricas do sistema não estão disponíveis no momento.</p>
          </div>
        )}
      </div>
      <AccessibilityPanel />
    </div>
  );
}

export default Metrics;


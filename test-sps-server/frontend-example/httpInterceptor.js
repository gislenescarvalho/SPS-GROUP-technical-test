// Exemplo de Interceptor HTTP para Frontend (Axios)
import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log da requisição
    console.log(`🚀 Requisição: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // Log da resposta
    console.log(`✅ Resposta: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.response?.data);
    
    // Tratamento de erros de autenticação
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirecionar para login
      window.location.href = '/login';
    }
    
    // Tratamento de erros de autorização
    if (error.response?.status === 403) {
      console.error('Acesso negado');
      // Mostrar mensagem de erro para o usuário
    }
    
    return Promise.reject(error);
  }
);

// Função para fazer logout
export const logout = async () => {
  try {
    // Chamar endpoint de logout
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Erro no logout:', error);
  } finally {
    // Limpar estado local
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirecionar para login
    window.location.href = '/login';
  }
};

// Função para verificar se token está expirado
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return true;
  }
};

// Função para renovar token automaticamente
export const refreshTokenIfNeeded = async () => {
  const token = localStorage.getItem('authToken');
  
  if (isTokenExpired(token)) {
    console.log('Token expirado, fazendo logout...');
    await logout();
    return false;
  }
  
  return true;
};

// Middleware para verificar autenticação antes de cada requisição
api.interceptors.request.use(async (config) => {
  // Verificar se token está expirado antes de cada requisição
  const isTokenValid = await refreshTokenIfNeeded();
  
  if (!isTokenValid) {
    // Cancelar requisição se token não é válido
    return Promise.reject(new Error('Token expirado'));
  }
  
  return config;
});

export default api;

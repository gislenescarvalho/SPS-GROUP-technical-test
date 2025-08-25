import { useState, useCallback } from 'react';

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  // Função para processar mensagens de erro e torná-las mais amigáveis
  const processErrorMessage = (message) => {
    if (!message) {
      return 'Ocorreu um erro inesperado. Tente novamente.';
    }

    // Se a mensagem já parece amigável, retornar como está
    if (message.includes('Tente novamente') || 
        message.includes('Verifique') || 
        message.includes('Certifique-se') ||
        message.includes('Por favor')) {
      return message;
    }

    // Mapear mensagens técnicas para mensagens amigáveis
    const errorMappings = {
      'Network Error': 'Erro de conexão. Verifique sua internet e tente novamente.',
      'Request failed': 'Falha na requisição. Tente novamente em alguns instantes.',
      'Timeout': 'A operação demorou muito. Tente novamente.',
      'Unauthorized': 'Sessão expirada. Faça login novamente.',
      'Forbidden': 'Você não tem permissão para realizar esta ação.',
      'Not Found': 'Recurso não encontrado.',
      'Internal Server Error': 'Erro interno do servidor. Tente novamente mais tarde.',
      'Bad Request': 'Dados inválidos. Verifique as informações e tente novamente.',
      'Validation failed': 'Dados inválidos. Verifique as informações fornecidas.',
      'Email inválido': 'Por favor, insira um email válido.',
      'Senha deve ter pelo menos 4 caracteres': 'A senha deve ter pelo menos 4 caracteres.',
      'Credenciais inválidas': 'Email ou senha incorretos. Tente novamente.',
      'Resposta inválida do servidor': 'Erro de comunicação com o servidor. Tente novamente.',
      'Dados de autenticação incompletos': 'Erro na autenticação. Tente fazer login novamente.',
      'Erro ao fazer login': 'Não foi possível fazer login. Verifique suas credenciais.',
      'Erro ao salvar dados de autenticação': 'Erro ao salvar dados. Tente novamente.',
      'Erro ao configurar autenticação': 'Erro na configuração. Tente novamente.',
      'Refresh token não encontrado': 'Sessão expirada. Faça login novamente.',
      'Erro ao renovar token': 'Erro na renovação da sessão. Faça login novamente.',
      'Erro ao obter estatísticas': 'Não foi possível carregar as estatísticas.',
      'Senha atual e nova senha são obrigatórias': 'Por favor, preencha todos os campos de senha.',
      'Nova senha deve ter pelo menos 4 caracteres': 'A nova senha deve ter pelo menos 4 caracteres.',
      'Nova senha e confirmação não coincidem': 'A nova senha e a confirmação não são iguais.',
      'Erro ao alterar senha': 'Não foi possível alterar a senha. Tente novamente.',
      'Erro ao solicitar reset de senha': 'Não foi possível solicitar o reset da senha.',
      'Token de reset é obrigatório': 'Token de reset inválido ou expirado.',
      'Erro ao resetar senha': 'Não foi possível resetar a senha. Tente novamente.',
      'Email deve ter um formato válido': 'Por favor, insira um email válido.',
      'Nome deve ter pelo menos 2 caracteres': 'O nome deve ter pelo menos 2 caracteres.',
      'Tipo deve ser "user" ou "admin"': 'Tipo de usuário inválido.',
      'Usuário não encontrado': 'Usuário não encontrado.',
      'Não é possível deletar o último administrador': 'Não é possível remover o último administrador.',
      'Erro ao deletar usuário': 'Não foi possível remover o usuário.',
      'Erro ao buscar usuários': 'Não foi possível carregar a lista de usuários.',
      'Erro ao atualizar usuário': 'Não foi possível atualizar o usuário.',
      'Erro ao criar usuário': 'Não foi possível criar o usuário.'
    };

    // Verificar se há um mapeamento específico
    for (const [technicalError, friendlyMessage] of Object.entries(errorMappings)) {
      if (message.includes(technicalError) || message === technicalError) {
        return friendlyMessage;
      }
    }

    // Se não há mapeamento específico, tornar a mensagem mais amigável
    if (message.toLowerCase().includes('error') || 
        message.toLowerCase().includes('failed') || 
        message.toLowerCase().includes('exception')) {
      return 'Ocorreu um erro inesperado. Tente novamente.';
    }

    // Se a mensagem parece ser técnica, adicionar contexto
    if (message.includes('status') || 
        message.includes('response') || 
        message.includes('request') ||
        message.includes('network')) {
      return 'Erro de comunicação. Tente novamente.';
    }

    // Retornar a mensagem original se parece ser amigável
    return message;
  };

  const addToast = useCallback(({ message, type = 'info', duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const processedMessage = type === 'error' ? processErrorMessage(message) : message;
    
    const newToast = {
      id,
      message: processedMessage,
      type,
      duration
    };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((message, duration = 5000) => {
    return addToast({ message, type: 'success', duration });
  }, [addToast]);

  const showError = useCallback((message, duration = 7000) => {
    return addToast({ message, type: 'error', duration });
  }, [addToast]);

  const showWarning = useCallback((message, duration = 6000) => {
    return addToast({ message, type: 'warning', duration });
  }, [addToast]);

  const showInfo = useCallback((message, duration = 5000) => {
    return addToast({ message, type: 'info', duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useToast;

// Data Transfer Objects para Usuários
class UserDTO {
  // Converte usuário para resposta da API (sem senha)
  static toResponse(user) {
    if (!user) return null;
    
    const { password, ...userResponse } = user;
    return {
      ...userResponse,
      id: parseInt(userResponse.id)
    };
  }

  // Converte lista de usuários para resposta da API
  static toResponseList(users) {
    return users.map(user => this.toResponse(user));
  }

  // Converte dados de entrada para criação de usuário
  static toCreate(userData) {
    return {
      name: userData.name?.trim(),
      email: userData.email?.toLowerCase().trim(),
      type: userData.type,
      password: userData.password // será hasheada no service
    };
  }

  // Converte dados de entrada para atualização de usuário
  static toUpdate(userData) {
    const updateData = {};
    
    if (userData.name !== undefined) {
      updateData.name = userData.name?.trim();
    }
    
    if (userData.email !== undefined) {
      updateData.email = userData.email?.toLowerCase().trim();
    }
    
    if (userData.type !== undefined) {
      updateData.type = userData.type;
    }
    
    if (userData.password !== undefined) {
      updateData.password = userData.password; // será hasheada no service
    }
    
    return updateData;
  }

  // Converte dados para resposta de paginação
  static toPaginatedResponse(users, pagination) {
    return {
      data: this.toResponseList(users),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      }
    };
  }

  // Valida se o usuário tem permissões de admin
  static isAdmin(user) {
    return user && user.type === 'admin';
  }

  // Verifica se o usuário pode ser deletado
  static canBeDeleted(user) {
    return user && user.id !== 1; // Não pode deletar o admin principal
  }
}

module.exports = UserDTO;

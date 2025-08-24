class UserDTO {
  static toResponse(user) {
    if (!user) return null;
    
    const { password, ...userResponse } = user;
    return {
      ...userResponse,
      id: parseInt(userResponse.id)
    };
  }

  static toResponseList(users) {
    return users.map(user => this.toResponse(user));
  }

  static toCreate(userData) {
    return {
      name: userData.name?.trim(),
      email: userData.email?.toLowerCase().trim(),
      type: userData.type,
      password: userData.password
    };
  }

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
      updateData.password = userData.password;
    }
    
    return updateData;
  }

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

  static isAdmin(user) {
    return user && user.type === 'admin';
  }

  static canBeDeleted(user) {
    return user && user.id !== 1;
  }
}

module.exports = UserDTO;

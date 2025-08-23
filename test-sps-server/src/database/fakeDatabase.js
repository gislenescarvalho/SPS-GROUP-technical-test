const bcrypt = require('bcryptjs');
const config = require('../config');

// Banco de dados fake em memória
let users = [
  {
    id: 1,
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eO" // "1234" hasheada
  }
];

let nextId = 2;

class FakeDatabase {
  // Inicializar banco com senhas hasheadas (apenas na primeira execução)
  async initializeDatabase() {
    // Se a senha do admin ainda estiver em texto plano, hashear
    const adminUser = users.find(u => u.id === 1);
    if (adminUser && adminUser.password === "1234") {
      adminUser.password = await bcrypt.hash("1234", config.security.bcryptRounds);
    }
  }

  // Hash de senha
  async hashPassword(password) {
    return await bcrypt.hash(password, config.security.bcryptRounds);
  }

  // Verificar senha
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Buscar todos os usuários
  getAllUsers() {
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  // Buscar usuário por ID
  getUserById(id) {
    const user = users.find(u => u.id === parseInt(id));
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Buscar usuário por email (inclui senha para autenticação)
  getUserByEmail(email) {
    return users.find(u => u.email === email);
  }

  // Criar novo usuário
  async createUser(userData) {
    // Hash da senha antes de salvar
    const hashedPassword = await this.hashPassword(userData.password);
    
    const newUser = {
      id: nextId++,
      ...userData,
      password: hashedPassword
    };
    users.push(newUser);
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Atualizar usuário
  async updateUser(id, userData) {
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) return null;

    // Se a senha está sendo atualizada, hashear
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    users[index] = { ...users[index], ...userData };
    
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  }

  // Deletar usuário
  deleteUser(id) {
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) return false;

    users.splice(index, 1);
    return true;
  }

  // Verificar se email já existe
  emailExists(email, excludeId = null) {
    return users.some(u => u.email === email && u.id !== excludeId);
  }

  // Autenticar usuário (verificar email e senha)
  async authenticateUser(email, password) {
    const user = this.getUserByEmail(email);
    if (!user) return null;

    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// Criar instância e inicializar
const fakeDatabase = new FakeDatabase();

// Inicializar banco de dados (hashear senhas se necessário)
fakeDatabase.initializeDatabase().catch(console.error);

module.exports = fakeDatabase;

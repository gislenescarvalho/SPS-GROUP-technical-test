const bcrypt = require('bcryptjs');
const config = require('../config');

let users = [
  {
    id: 1,
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eO"
  }
];

let nextId = 2;

class FakeDatabase {
  async initializeDatabase() {
    const adminUser = users.find(u => u.id === 1);
    if (adminUser && adminUser.password === "1234") {
      adminUser.password = await bcrypt.hash("1234", config.security.bcryptRounds);
    }
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, config.security.bcryptRounds);
  }

  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  getAllUsers() {
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  getUserById(id) {
    const user = users.find(u => u.id === parseInt(id));
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getUserByEmail(email) {
    return users.find(u => u.email === email);
  }

  async createUser(userData) {
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

  async updateUser(id, userData) {
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) return null;

    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    users[index] = { ...users[index], ...userData };
    
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  }

  deleteUser(id) {
    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) return false;

    users.splice(index, 1);
    return true;
  }

  emailExists(email, excludeId = null) {
    return users.some(u => u.email === email && u.id !== excludeId);
  }

  async authenticateUser(email, password) {
    const user = this.getUserByEmail(email);
    if (!user) return null;

    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

const fakeDatabase = new FakeDatabase();

fakeDatabase.initializeDatabase().catch(console.error);

module.exports = fakeDatabase;

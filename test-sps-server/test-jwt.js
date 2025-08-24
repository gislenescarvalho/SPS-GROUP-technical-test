const jwt = require('jsonwebtoken');

// Configuração do JWT
const JWT_SECRET = 'sps-secret-key-development-2024';
const JWT_EXPIRES_IN = '24h';
const JWT_REFRESH_EXPIRES_IN = '7d';

// Função para gerar token de acesso
function generateAccessToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      type: user.type 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Função para verificar se token está expirado
function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    const payload = jwt.decode(token);
    if (!payload || !payload.exp) return true;
    
    const expiry = payload.exp * 1000;
    const now = Date.now();
    
    // Adicionar margem de segurança de 5 minutos
    const safetyMargin = 5 * 60 * 1000; // 5 minutos
    
    return now >= (expiry - safetyMargin);
  } catch (error) {
    console.warn('Erro ao decodificar token:', error);
    return true;
  }
}

// Função para obter tempo restante do token
function getTokenTimeRemaining(token) {
  if (!token) return 0;
  
  try {
    const payload = jwt.decode(token);
    if (!payload || !payload.exp) return 0;
    
    const expiry = payload.exp * 1000;
    const now = Date.now();
    
    // Adicionar margem de segurança de 5 minutos
    const safetyMargin = 5 * 60 * 1000; // 5 minutos
    
    return Math.max(0, (expiry - safetyMargin) - now);
  } catch (error) {
    console.warn('Erro ao decodificar token:', error);
    return 0;
  }
}

// Teste
console.log('🔐 Testando JWT...\n');

const testUser = {
  id: 1,
  email: 'admin@spsgroup.com.br',
  type: 'admin'
};

// Gerar token
const token = generateAccessToken(testUser);
console.log('Token gerado:', token.substring(0, 50) + '...');

// Decodificar token
const decoded = jwt.decode(token);
console.log('Payload decodificado:', decoded);

// Verificar expiração
const isExpired = isTokenExpired(token);
console.log('Token expirado:', isExpired);

// Tempo restante
const timeRemaining = getTokenTimeRemaining(token);
console.log('Tempo restante (ms):', timeRemaining);
console.log('Tempo restante (minutos):', Math.floor(timeRemaining / 60000));

// Verificar com jwt.verify
try {
  const verified = jwt.verify(token, JWT_SECRET);
  console.log('Token verificado com sucesso:', verified);
} catch (error) {
  console.error('Erro na verificação:', error.message);
}

console.log('\n✅ Teste concluído!');

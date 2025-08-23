#!/usr/bin/env node

/**
 * Script para testar a integração entre frontend e backend
 * 
 * Uso:
 * node test-integration.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'admin@spsgroup.com.br',
  password: '1234'
};

class IntegrationTester {
  constructor() {
    this.token = null;
    this.testResults = [];
  }

  async run() {
    console.log('🚀 Iniciando testes de integração...\n');
    
    try {
      await this.testAuth();
      await this.testSecurity();
      await this.testUsers();
      await this.testMetrics();
      await this.printResults();
    } catch (error) {
      console.error('❌ Erro durante os testes:', error.message);
      process.exit(1);
    }
  }

  async testAuth() {
    console.log('🔐 Testando autenticação...');
    
    // Teste de login
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
      this.token = loginResponse.data.token;
      this.addResult('Login', 'PASS', 'Login realizado com sucesso');
      
      // Teste de logout
      await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.addResult('Logout', 'PASS', 'Logout realizado com sucesso');
      
    } catch (error) {
      this.addResult('Auth', 'FAIL', error.response?.data?.message || error.message);
    }
  }

  async testSecurity() {
    console.log('🛡️ Testando medidas de segurança...');
    
    try {
      // Teste de CORS
      const corsResponse = await axios.get(`${BASE_URL}/users`, {
        headers: { 'Origin': 'http://malicious-site.com' }
      });
      this.addResult('CORS', 'FAIL', 'CORS não está bloqueando origens maliciosas');
    } catch (error) {
      if (error.response?.status === 403) {
        this.addResult('CORS', 'PASS', 'CORS bloqueando origens não permitidas');
      } else {
        this.addResult('CORS', 'FAIL', 'Erro inesperado no teste de CORS');
      }
    }

    // Teste de headers de segurança
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      const headers = response.headers;
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security'
      ];
      
      const missingHeaders = securityHeaders.filter(header => !headers[header]);
      
      if (missingHeaders.length === 0) {
        this.addResult('Security Headers', 'PASS', 'Todos os headers de segurança presentes');
      } else {
        this.addResult('Security Headers', 'FAIL', `Headers ausentes: ${missingHeaders.join(', ')}`);
      }
      
    } catch (error) {
      this.addResult('Security Headers', 'FAIL', 'Erro ao verificar headers de segurança');
    }

    // Teste de rate limiting
    try {
      const promises = Array(105).fill().map(() => 
        axios.get(`${BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
      );
      
      const responses = await Promise.allSettled(promises);
      const rateLimited = responses.filter(r => 
        r.status === 'rejected' && r.reason.response?.status === 429
      );
      
      if (rateLimited.length > 0) {
        this.addResult('Rate Limiting', 'PASS', 'Rate limiting funcionando corretamente');
      } else {
        this.addResult('Rate Limiting', 'FAIL', 'Rate limiting não está ativo');
      }
      
    } catch (error) {
      this.addResult('Rate Limiting', 'FAIL', 'Erro no teste de rate limiting');
    }
  }

  async testUsers() {
    console.log('👥 Testando endpoints de usuários...');
    
    if (!this.token) {
      this.addResult('Users', 'SKIP', 'Token não disponível');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    try {
      // Teste de listagem
      const listResponse = await axios.get(`${BASE_URL}/users`, { headers });
      this.addResult('List Users', 'PASS', `Encontrados ${listResponse.data.users?.length || 0} usuários`);

      // Teste de busca
      const searchResponse = await axios.get(`${BASE_URL}/users?search=admin`, { headers });
      this.addResult('Search Users', 'PASS', 'Busca funcionando');

      // Teste de paginação
      const paginationResponse = await axios.get(`${BASE_URL}/users?page=1&limit=5`, { headers });
      this.addResult('Pagination', 'PASS', 'Paginação funcionando');

      // Teste de criação (se houver dados de paginação)
      if (paginationResponse.data.pagination) {
        const newUser = {
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          password: '123456',
          type: 'user'
        };

        const createResponse = await axios.post(`${BASE_URL}/users`, newUser, { headers });
        this.addResult('Create User', 'PASS', 'Usuário criado com sucesso');

        // Teste de atualização
        const userId = createResponse.data.id;
        const updateData = { name: 'Updated Test User' };
        await axios.put(`${BASE_URL}/users/${userId}`, updateData, { headers });
        this.addResult('Update User', 'PASS', 'Usuário atualizado com sucesso');

        // Teste de busca por ID
        await axios.get(`${BASE_URL}/users/${userId}`, { headers });
        this.addResult('Get User by ID', 'PASS', 'Busca por ID funcionando');

        // Teste de exclusão
        await axios.delete(`${BASE_URL}/users/${userId}`, { headers });
        this.addResult('Delete User', 'PASS', 'Usuário excluído com sucesso');
      }

    } catch (error) {
      this.addResult('Users', 'FAIL', error.response?.data?.message || error.message);
    }
  }

  async testMetrics() {
    console.log('📊 Testando endpoints de métricas...');
    
    if (!this.token) {
      this.addResult('Metrics', 'SKIP', 'Token não disponível');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    try {
      // Teste de métricas gerais
      const metricsResponse = await axios.get(`${BASE_URL}/metrics`, { headers });
      this.addResult('General Metrics', 'PASS', 'Métricas gerais obtidas');

      // Teste de métricas de performance
      const perfResponse = await axios.get(`${BASE_URL}/metrics/performance`, { headers });
      this.addResult('Performance Metrics', 'PASS', 'Métricas de performance obtidas');

      // Teste de métricas de usuários
      const userMetricsResponse = await axios.get(`${BASE_URL}/metrics/users`, { headers });
      this.addResult('User Metrics', 'PASS', 'Métricas de usuários obtidas');

      // Teste de métricas de autenticação
      const authMetricsResponse = await axios.get(`${BASE_URL}/metrics/auth`, { headers });
      this.addResult('Auth Metrics', 'PASS', 'Métricas de autenticação obtidas');

      // Teste de métricas de cache
      const cacheMetricsResponse = await axios.get(`${BASE_URL}/metrics/cache`, { headers });
      this.addResult('Cache Metrics', 'PASS', 'Métricas de cache obtidas');

    } catch (error) {
      this.addResult('Metrics', 'FAIL', error.response?.data?.message || error.message);
    }
  }

  addResult(test, status, message) {
    this.testResults.push({ test, status, message });
  }

  printResults() {
    console.log('\n📋 Resultados dos Testes:\n');
    
    const results = {
      PASS: [],
      FAIL: [],
      SKIP: []
    };

    this.testResults.forEach(result => {
      results[result.status].push(result);
    });

    // Testes que passaram
    if (results.PASS.length > 0) {
      console.log('✅ Testes que passaram:');
      results.PASS.forEach(result => {
        console.log(`   ${result.test}: ${result.message}`);
      });
      console.log('');
    }

    // Testes que falharam
    if (results.FAIL.length > 0) {
      console.log('❌ Testes que falharam:');
      results.FAIL.forEach(result => {
        console.log(`   ${result.test}: ${result.message}`);
      });
      console.log('');
    }

    // Testes pulados
    if (results.SKIP.length > 0) {
      console.log('⏭️  Testes pulados:');
      results.SKIP.forEach(result => {
        console.log(`   ${result.test}: ${result.message}`);
      });
      console.log('');
    }

    // Resumo
    const total = this.testResults.length;
    const passed = results.PASS.length;
    const failed = results.FAIL.length;
    const skipped = results.SKIP.length;

    console.log('📊 Resumo:');
    console.log(`   Total: ${total}`);
    console.log(`   Passaram: ${passed}`);
    console.log(`   Falharam: ${failed}`);
    console.log(`   Pulados: ${skipped}`);
    console.log(`   Taxa de sucesso: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n⚠️  Alguns testes falharam. Verifique se o backend está rodando corretamente.');
      process.exit(1);
    } else {
      console.log('\n🎉 Todos os testes passaram! A integração está funcionando corretamente.');
    }
  }
}

// Verificar se o backend está rodando
async function checkBackend() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Executar testes
async function main() {
  console.log('🔍 Verificando se o backend está rodando...');
  
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    console.error('❌ Backend não está rodando em http://localhost:3000');
    console.log('💡 Execute: cd test-sps-server && npm run dev');
    process.exit(1);
  }

  console.log('✅ Backend está rodando!\n');

  const tester = new IntegrationTester();
  await tester.run();
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = IntegrationTester;

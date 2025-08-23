# Segurança e Qualidade - Frontend React

Este documento descreve as medidas de segurança e qualidade implementadas no frontend React.

## 🔒 Medidas de Segurança Implementadas

### 1. **CORS (Cross-Origin Resource Sharing)**

#### Configuração no Backend
```javascript
// Configuração segura de CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (config.cors.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400
};
```

#### Origens Permitidas
- `http://localhost:3000` (Backend)
- `http://localhost:3001` (Frontend)
- `https://localhost:3000` (HTTPS)
- `https://localhost:3001` (HTTPS)

### 2. **Helmet - Headers de Segurança**

#### Headers Configurados
```javascript
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true
};
```

#### Headers de Segurança Adicionais
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### 3. **Validação e Sanitização de Dados**

#### Sanitização de Entrada
```javascript
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remover < e >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
};
```

#### Validação de Email
```javascript
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

#### Validação de Senha Forte
```javascript
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: { /* detalhes dos erros */ }
  };
};
```

### 4. **Detecção de XSS**

#### Padrões de XSS Detectados
```javascript
const xssPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
];
```

### 5. **Armazenamento Seguro**

#### localStorage Seguro
```javascript
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const sanitizedValue = typeof value === 'string' ? 
        sanitizeInput(value) : JSON.stringify(value);
      localStorage.setItem(key, sanitizedValue);
    } catch (error) {
      logSecurityEvent('storage_error', { key, error: error.message });
    }
  },
  
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? sanitizeInput(value) : null;
    } catch (error) {
      logSecurityEvent('storage_error', { key, error: error.message });
      return null;
    }
  }
};
```

### 6. **Rate Limiting**

#### Configuração
- **Limite**: 100 requisições por IP
- **Janela**: 15 minutos
- **Armazenamento**: Redis
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 7. **Autenticação JWT**

#### Tokens Seguros
- **Access Token**: 24 horas
- **Refresh Token**: 7 dias
- **Renovação Automática**: Implementada
- **Validação de Expiração**: Implementada

#### Headers de Autenticação
```javascript
config.headers = {
  ...config.headers,
  'X-Requested-With': 'XMLHttpRequest',
  'X-CSRF-Token': generateCSRFToken()
};
```

## 📝 Mensagens de Erro Consistentes

### Padrão de Mensagens
```javascript
const errorMessages = {
  400: 'Dados inválidos. Verifique as informações enviadas.',
  401: 'Não autorizado. Faça login novamente.',
  403: 'Acesso negado. Você não tem permissão para acessar este recurso.',
  404: 'Recurso não encontrado. Verifique a URL ou o ID informado.',
  409: 'Conflito. O recurso já existe ou está em uso.',
  422: 'Dados inválidos. Verifique os campos obrigatórios.',
  429: 'Muitas requisições. Tente novamente em alguns minutos.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
  503: 'Serviço em manutenção. Tente novamente mais tarde.',
  504: 'Timeout do servidor. Tente novamente em alguns minutos.'
};
```

### Componente de Tratamento de Erros
```javascript
const ErrorHandler = ({ 
  error, 
  onRetry, 
  onClose, 
  showDetails = false,
  variant = 'error' // 'error', 'warning', 'info'
}) => {
  // Implementação com mensagens consistentes
};
```

## 🔍 Logging e Monitoramento

### Eventos de Segurança Logados
- `login_success` - Login bem-sucedido
- `login_failed` - Tentativa de login falhada
- `logout_success` - Logout bem-sucedido
- `unauthorized_access` - Tentativa de acesso não autorizado
- `forbidden_access` - Tentativa de acesso negado
- `token_refresh_failed` - Falha na renovação de token
- `xss_attempt` - Tentativa de XSS detectada
- `storage_error` - Erro no armazenamento
- `api_error` - Erro na API

### Estrutura do Log
```javascript
const securityLog = {
  timestamp: new Date().toISOString(),
  event: 'login_success',
  details: {
    userId: user.id,
    userEmail: user.email
  },
  userAgent: navigator.userAgent,
  url: window.location.href
};
```

## 🛡️ Proteções Adicionais

### 1. **CSRF Protection**
- Tokens CSRF gerados automaticamente
- Validação em todas as requisições POST/PUT/DELETE

### 2. **Content Security Policy (CSP)**
- Restrição de recursos externos
- Prevenção de XSS e injection attacks

### 3. **Session Management**
- Timeout de sessão configurável
- Extensão automática com atividade
- Logout automático em inatividade

### 4. **Input Validation**
- Validação no frontend e backend
- Sanitização de dados antes do envio
- Validação de tipos e formatos

### 5. **Error Handling**
- Mensagens de erro não expõem informações sensíveis
- Logs detalhados para debugging
- Fallbacks para cenários de erro

## 🧪 Testes de Segurança

### Testes Implementados
```bash
# Testes de validação
npm test -- --testPathPattern=validation

# Testes de autenticação
npm test -- --testPathPattern=auth

# Testes de sanitização
npm test -- --testPathPattern=sanitization

# Testes de integração
npm run test:integration
```

### Cenários Testados
- ✅ Validação de email
- ✅ Validação de senha forte
- ✅ Sanitização de entrada
- ✅ Detecção de XSS
- ✅ Autenticação JWT
- ✅ Rate limiting
- ✅ CORS
- ✅ Headers de segurança

## 📊 Métricas de Segurança

### Métricas Monitoradas
- **Taxa de login falhado**
- **Tentativas de XSS**
- **Acessos não autorizados**
- **Erros de validação**
- **Tempo de resposta da API**
- **Uso de recursos**

### Alertas Configurados
- Taxa de erro > 5%
- Múltiplas tentativas de login
- Tentativas de XSS
- Acessos não autorizados

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente
```env
# Segurança
REACT_APP_SECURITY_LEVEL=high
REACT_APP_ENABLE_CSP=true
REACT_APP_ENABLE_HSTS=true

# Logging
REACT_APP_LOG_LEVEL=info
REACT_APP_LOG_SECURITY=true

# Rate Limiting
REACT_APP_RATE_LIMIT_ENABLED=true
REACT_APP_RATE_LIMIT_MAX=100
```

## 🚨 Incidentes de Segurança

### Procedimentos
1. **Detecção**: Logs automáticos
2. **Análise**: Revisão de logs
3. **Contenção**: Bloqueio temporário
4. **Correção**: Aplicação de patches
5. **Recuperação**: Restauração de serviços
6. **Análise Pós-Incidente**: Documentação

### Contatos de Emergência
- **Desenvolvedor**: [email]
- **Segurança**: [email]
- **Infraestrutura**: [email]

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [JWT Security](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Responsável**: Equipe de Desenvolvimento SPS Group


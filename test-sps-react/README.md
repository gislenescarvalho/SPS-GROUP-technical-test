# SPS React Test

Aplicação React para gerenciamento de usuários com autenticação JWT, recursos de acessibilidade, design responsivo e modais de confirmação.

## Funcionalidades Implementadas

- ✅ Página de login (SignIn) com autenticação JWT
- ✅ Armazenamento de token no localStorage
- ✅ Proteção de rotas (só é possível acessar páginas autenticadas)
- ✅ Listagem de usuários
- ✅ Criação de novos usuários
- ✅ Edição de usuários existentes
- ✅ Exclusão de usuários
- ✅ Integração com a API do servidor (test-sps-server)
- ✅ **Sistema completo de acessibilidade**
- ✅ **Modo escuro/claro**
- ✅ **Controle de tamanho de fonte**
- ✅ **Alto contraste**
- ✅ **Redução de movimento**
- ✅ **Navegação por teclado**
- ✅ **Suporte a leitores de tela**
- ✅ **Design responsivo completo**
- ✅ **Menu mobile adaptativo**
- ✅ **Tabelas responsivas**
- ✅ **Formulários adaptáveis**
- ✅ **Modais de confirmação e feedback**
- ✅ **Estado de lista vazia**
- ✅ **Validação de mudanças**

## Recursos de Acessibilidade

### ♿ Painel de Acessibilidade
- Botão flutuante no canto inferior direito
- Controles para personalizar a experiência do usuário
- Persistência das configurações no localStorage

### 🌙 Modo Escuro/Claro
- Alternância entre temas claro e escuro
- Cores otimizadas para cada tema
- Transições suaves entre os temas

### 📝 Controle de Tamanho de Fonte
- 4 tamanhos disponíveis: Pequeno, Médio, Grande, Muito Grande
- Botões A-, A, A+ para controle intuitivo
- Aplicação global em toda a aplicação

### 🎨 Alto Contraste
- Modo de alto contraste para melhor legibilidade
- Cores otimizadas para usuários com baixa visão
- Contraste adequado seguindo WCAG 2.1

### 🚫 Redução de Movimento
- Opção para reduzir animações e transições
- Respeita as preferências do usuário
- Melhora a experiência para usuários com sensibilidade a movimento

### ⌨️ Navegação por Teclado
- Navegação completa via Tab
- Atalhos de teclado (Esc para fechar painéis)
- Indicadores de foco visíveis
- Suporte a Enter e Espaço para ativação

### 🎧 Suporte a Leitores de Tela
- Atributos ARIA apropriados
- Labels descritivos para todos os elementos
- Estrutura semântica adequada
- Textos alternativos para elementos interativos

## Design Responsivo

### 📱 Mobile First
- Design otimizado para dispositivos móveis
- Breakpoints responsivos: 360px, 480px, 768px, 1024px, 1440px
- Navegação adaptativa com menu hambúrguer
- Tabelas com scroll horizontal

### 🖥️ Desktop
- Layout otimizado para telas grandes
- Navegação horizontal completa
- Tabelas com todas as colunas visíveis
- Formulários em grid responsivo

### 📊 Tabelas Responsivas
- Scroll horizontal em dispositivos pequenos
- Colunas com largura mínima adequada
- Botões de ação empilhados em mobile
- Texto adaptativo para diferentes tamanhos

### 📝 Formulários Adaptáveis
- Grid responsivo com `auto-fit`
- Campos empilhados em mobile
- Botões com tamanho mínimo para touch
- Espaçamento otimizado para cada dispositivo

### 🎯 Touch-Friendly
- Botões com mínimo de 44px de altura
- Espaçamento adequado entre elementos
- Estados visuais claros para interação
- Suporte a gestos touch

## Modais de Confirmação e Feedback

### 🎭 Componente Modal Reutilizável
- Modal responsivo e acessível
- Tamanhos configuráveis (small, medium, large)
- Fechamento por clique fora ou botão X
- Suporte a navegação por teclado (Esc)

### ✅ Confirmação de Ações
- Modal para confirmar exclusão de usuários
- Modal para confirmar alterações na edição
- Exibição do nome do usuário afetado
- Aviso sobre ações irreversíveis

### 📢 Feedback de Operações
- Modal de sucesso para operações bem-sucedidas
- Modal de erro para operações que falharam
- Mensagens específicas e informativas
- Ícones visuais para melhor compreensão

### 🎯 Estados dos Modais
- **Confirmação**: Requer ação do usuário (Confirmar/Cancelar)
- **Sucesso**: Informa operação bem-sucedida com botão OK
- **Erro**: Informa erro com botão OK para fechar

## Estados da Interface

### 📋 Estado de Lista Vazia
- Interface dedicada quando não há usuários
- Ícone ilustrativo e mensagem explicativa
- Call-to-action para criar primeiro usuário
- Design atrativo e motivacional

### ⏳ Estados de Loading
- Loading durante carregamento inicial
- Loading durante criação de usuários
- Loading durante edição de usuários
- Loading durante exclusão de usuários
- Feedback visual com texto explicativo

### ❌ Estados de Erro
- Modais de erro para operações que falharam
- Mensagens específicas do backend
- Posicionamento consistente
- Tratamento de erros em todas as operações

### ✅ Estados de Sucesso
- Modais de sucesso após operações bem-sucedidas
- Redirecionamento automático após confirmação
- Limpeza de formulários
- Atualização da lista de usuários

## Validações e Segurança

### 🔒 Validações de Campo
- Validação HTML5 (required, type="email")
- Validação de email único no backend
- Validação de campos obrigatórios
- Validação de formato de email
- Validação de força de senha

### 🛡️ Proteções de Segurança
- Proteção para admin principal (não pode ser excluído)
- Confirmação para ações destrutivas
- Validação de mudanças antes de salvar
- Tratamento de erros de rede

## Pré-requisitos

- Node.js (versão 14 ou superior)
- Servidor backend rodando (test-sps-server)

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure a URL do servidor:
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
```
REACT_APP_SERVER_URL=http://localhost:3000
```

4. Inicie o servidor backend (test-sps-server):
```bash
cd ../test-sps-server
npm install
npm start
```

5. Em outro terminal, inicie a aplicação React:
```bash
npm start
```

## Como usar

1. Acesse a aplicação em `http://localhost:3001`
2. Faça login com as credenciais padrão:
   - Email: `admin@spsgroup.com.br`
   - Senha: `1234`
3. Após o login, você será redirecionado para a página de usuários
4. Use as funcionalidades disponíveis:
   - Visualizar lista de usuários
   - Criar novos usuários (formulário inline)
   - Editar usuários existentes (com confirmação)
   - Excluir usuários (com confirmação)

### 🎛️ Usando os Recursos de Acessibilidade

1. **Acessar o painel**: Clique no botão ♿ no canto inferior direito
2. **Alternar tema**: Use o botão "Modo Escuro/Claro" no painel
3. **Ajustar fonte**: Use os botões A-, A, A+ no painel
4. **Alto contraste**: Ative a opção "Alto Contraste" no painel
5. **Reduzir movimento**: Ative a opção "Redução de Movimento" no painel
6. **Navegar por teclado**: Use Tab para navegar e Enter/Espaço para ativar
7. **Fechar painel**: Pressione Esc ou clique no X

### 📱 Usando em Dispositivos Móveis

1. **Menu mobile**: Toque no ícone ☰ no canto superior direito
2. **Navegação**: Use o menu deslizante para acessar páginas
3. **Tabelas**: Deslize horizontalmente para ver todas as colunas
4. **Formulários**: Preencha os campos empilhados verticalmente
5. **Botões**: Toque nos botões com área mínima de 44px
6. **Modais**: Toque fora do modal ou no X para fechar

### 🎭 Usando os Modais

1. **Criar usuário**: Clique em "Novo Usuário" → Preencha o formulário → Clique "Criar Usuário" → Confirme no modal de sucesso
2. **Editar usuário**: Clique em "Editar" → Faça alterações → Clique "Salvar" → Confirme no modal → Confirme sucesso
3. **Excluir usuário**: Clique em "Excluir" → Confirme no modal de exclusão → Confirme sucesso
4. **Fechar modais**: Clique fora do modal, no X ou pressione Esc

## Estrutura do Projeto

```
src/
├── components/
│   ├── ProtectedRoute.js        # Componente para proteger rotas
│   ├── Navbar.js               # Navegação responsiva
│   ├── AccessibilityPanel.js   # Painel de acessibilidade
│   └── Modal.js               # Componente modal reutilizável
├── contexts/
│   ├── AuthContext.js          # Contexto de autenticação
│   └── AccessibilityContext.js # Contexto de acessibilidade
├── pages/
│   ├── Home.js                 # Página inicial responsiva
│   ├── SignIn.js               # Página de login responsiva
│   ├── Users.js                # Lista e criação de usuários com modais
│   └── UserEdit.js             # Edição de usuários com confirmação
├── services/
│   ├── AuthService.js          # Serviço de autenticação
│   └── UserService.js          # Serviço de usuários
├── styles/
│   └── accessibility.css       # Estilos de acessibilidade e responsividade
├── routes.js                   # Configuração de rotas
└── index.js                    # Ponto de entrada
```

## Tecnologias Utilizadas

- React 18
- React Router DOM
- Axios para requisições HTTP
- Context API para gerenciamento de estado
- localStorage para persistência de dados
- CSS Variables para temas dinâmicos
- CSS Grid e Flexbox para layout responsivo
- Media Queries para breakpoints
- ARIA attributes para acessibilidade

## Funcionalidades Detalhadas

### Autenticação
- Login com email e senha
- Armazenamento seguro do token JWT
- Redirecionamento automático após login
- Logout com limpeza de dados

### Gerenciamento de Usuários
- Listagem paginada de usuários
- Criação de novos usuários com formulário inline
- Edição de dados de usuários existentes com confirmação
- Exclusão de usuários com modal de confirmação
- Diferenciação visual entre tipos de usuário (admin/user)

### Interface e Acessibilidade
- Design responsivo e moderno
- Feedback visual para ações do usuário
- Tratamento de erros com modais informativos
- Loading states para melhor UX
- **Sistema completo de acessibilidade WCAG 2.1**
- **Temas dinâmicos (claro/escuro)**
- **Controle de tamanho de fonte**
- **Alto contraste**
- **Redução de movimento**
- **Navegação por teclado completa**

### Responsividade
- **Mobile First Design**
- **Breakpoints otimizados**
- **Menu mobile adaptativo**
- **Tabelas responsivas**
- **Formulários adaptáveis**
- **Touch-friendly interface**

### Modais e Confirmações
- **Modal reutilizável e responsivo**
- **Confirmação de ações destrutivas**
- **Feedback de sucesso e erro**
- **Detecção de mudanças**
- **Estados de loading nos modais**

## Conformidade com Padrões

### WCAG 2.1 - Nível AA
- ✅ Contraste de cores adequado (4.5:1)
- ✅ Navegação por teclado completa
- ✅ Atributos ARIA apropriados
- ✅ Textos alternativos
- ✅ Estrutura semântica
- ✅ Redução de movimento
- ✅ Tamanhos de fonte ajustáveis

### Responsividade
- ✅ Mobile First Design
- ✅ Breakpoints bem definidos
- ✅ Touch-friendly interface
- ✅ Tabelas responsivas
- ✅ Formulários adaptáveis
- ✅ Navegação mobile otimizada

### Boas Práticas de UX
- ✅ Feedback visual imediato
- ✅ Estados de loading
- ✅ Mensagens de erro claras
- ✅ Confirmações para ações destrutivas
- ✅ Interface intuitiva e consistente
- ✅ Acessibilidade universal
- ✅ Modais de confirmação e feedback
- ✅ Estado de lista vazia

## Breakpoints Responsivos

| Dispositivo | Largura | Características |
|-------------|---------|-----------------|
| Mobile Pequeno | < 360px | Layout compacto, fonte menor |
| Mobile | < 480px | Menu hambúrguer, formulários empilhados |
| Tablet | < 768px | Grid 2 colunas, tabelas com scroll |
| Desktop Pequeno | < 1024px | Grid 3 colunas, navegação completa |
| Desktop | > 1024px | Grid 4 colunas, layout otimizado |
| Desktop Grande | > 1440px | Fonte maior, espaçamento ampliado |

## Configuração do Servidor

Certifique-se de que o servidor backend (test-sps-server) esteja rodando na porta 3000 e que as seguintes rotas estejam disponíveis:

- `POST /auth/login` - Autenticação
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário específico
- `POST /users` - Criar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Excluir usuário

## Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm test` - Executa os testes
- `npm run eject` - Ejecta a configuração do Create React App

## Contribuição

Esta aplicação foi desenvolvida seguindo as melhores práticas de acessibilidade, responsividade e UX, podendo ser usada como referência para implementar recursos similares em outras aplicações React.

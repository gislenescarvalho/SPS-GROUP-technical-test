# Sistema de Validação - SPS React Test

## Visão Geral

Este projeto implementa um sistema robusto de validação de formulários usando a biblioteca **Yup** para validação de esquemas e componentes React reutilizáveis para uma experiência de usuário consistente.

## Arquitetura

### 1. Validações (Yup Schemas)
**Arquivo:** `src/validations/userValidations.js`

- **createUserSchema**: Validação para criação de usuários
- **updateUserSchema**: Validação para atualização de usuários  
- **loginSchema**: Validação para login
- **validateData()**: Função utilitária para validar dados

### 2. Componente FormField
**Arquivo:** `src/components/FormField.js`

Componente reutilizável que:
- Suporta diferentes tipos de input (text, email, password, select, textarea)
- Exibe erros de validação com ícones visuais
- Implementa acessibilidade (ARIA labels, roles)
- Estilização consistente com variáveis CSS
- Validação em tempo real (onBlur)

### 3. Hook useValidation
**Arquivo:** `src/hooks/useValidation.js`

Hook personalizado que fornece:
- Validação de campos individuais
- Validação de formulário completo
- Controle de estado "touched" (campo foi interagido)
- Limpeza de erros
- Validação em tempo real

### 4. Serviço UserService
**Arquivo:** `src/services/UserService.js`

Métodos adicionados:
- **checkEmailExists()**: Verifica duplicação de email
- **validateUserData()**: Validação server-side adicional

## Funcionalidades Implementadas

### ✅ Validações de Campo

#### Nome
- Obrigatório
- Mínimo 2 caracteres
- Máximo 100 caracteres
- Apenas letras e espaços (incluindo acentos)

#### Email
- Obrigatório
- Formato válido de email
- Máximo 255 caracteres
- Conversão para lowercase
- **Bloqueio de duplicação**

#### Senha
- Obrigatória (apenas na criação)
- Mínimo 4 caracteres
- Máximo 50 caracteres

#### Tipo
- Obrigatório
- Valores permitidos: "user" ou "admin"

### ✅ Bloqueio de Email Duplicado

O sistema verifica duplicação de email em dois níveis:

1. **Frontend**: Antes do envio, consulta a lista de usuários
2. **Backend**: Validação adicional no servidor (implementada no UserService)

### ✅ Experiência do Usuário

- **Validação em tempo real**: Erros aparecem quando o usuário sai do campo (onBlur)
- **Feedback visual**: Bordas vermelhas e ícones de aviso
- **Mensagens claras**: Erros em português e específicos
- **Acessibilidade**: Labels ARIA e roles apropriados
- **Responsivo**: Funciona em diferentes tamanhos de tela

## Como Usar

### 1. Importar Dependências

```javascript
import FormField from '../components/FormField';
import { createUserSchema, validateData } from '../validations/userValidations';
import { useValidation } from '../hooks/useValidation';
```

### 2. Usar o Componente FormField

```javascript
<FormField
  label="Nome"
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  error={errors.name}
  required
  minLength={2}
  maxLength={100}
  placeholder="Digite seu nome"
/>
```

### 3. Implementar Validação

```javascript
const { errors, validateField, setFieldTouched } = useValidation(createUserSchema);

const handleBlur = (field) => (e) => {
  setFieldTouched(field);
  validateField(field, e.target.value);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const validation = await validateData(createUserSchema, formData);
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }
  // Enviar dados...
};
```

### 4. Verificar Email Duplicado

```javascript
const emailExists = await UserService.checkEmailExists(email, userId);
if (emailExists) {
  setErrors({ email: 'Este email já está em uso' });
  return;
}
```

## Vantagens da Implementação

### 🎯 **Yup como Biblioteca de Validação**
- **Simples e intuitivo**: API declarativa
- **Performance**: Validação eficiente
- **Flexível**: Fácil de estender e customizar
- **Bem mantido**: Comunidade ativa
- **TypeScript**: Suporte nativo

### 🔧 **Componente FormField Reutilizável**
- **DRY**: Evita repetição de código
- **Consistente**: UI/UX uniforme
- **Acessível**: Implementa padrões WCAG
- **Flexível**: Suporta múltiplos tipos de input

### ⚡ **Hook useValidation**
- **Reutilizável**: Pode ser usado em qualquer formulário
- **Performance**: Validação otimizada
- **Estado**: Gerencia erros e touched automaticamente
- **Tempo real**: Validação imediata

### 🛡️ **Segurança**
- **Dupla validação**: Frontend + Backend
- **Sanitização**: Dados limpos antes do envio
- **Prevenção**: Bloqueio de emails duplicados

## Exemplo Completo

Veja o arquivo `src/components/ValidationExample.js` para um exemplo completo de implementação com validação em tempo real.

## Manutenção

### Adicionar Nova Validação

1. **Atualizar schema** em `userValidations.js`
2. **Usar no componente** com FormField
3. **Testar** com diferentes cenários

### Customizar Mensagens

Edite as mensagens nos schemas Yup:

```javascript
name: yup
  .string()
  .required('Nome é obrigatório')
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
```

### Adicionar Novo Tipo de Campo

1. **Estender FormField** para suportar o novo tipo
2. **Adicionar validação** no schema apropriado
3. **Testar** acessibilidade e responsividade

## Conclusão

O sistema de validação implementado oferece:
- ✅ Validação robusta e confiável
- ✅ Experiência de usuário excelente
- ✅ Código limpo e manutenível
- ✅ Acessibilidade completa
- ✅ Performance otimizada
- ✅ Fácil extensão e customização


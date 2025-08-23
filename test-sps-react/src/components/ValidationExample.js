import React, { useState } from 'react';
import FormField from './FormField';
import { useValidation } from '../hooks/useValidation';
import { createUserSchema } from '../validations/userValidations';

const ValidationExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'user'
  });

  const { errors, validateField, setFieldTouched, clearErrors } = useValidation(createUserSchema);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar campo em tempo real
    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => (e) => {
    setFieldTouched(field);
    validateField(field, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aqui você pode implementar a lógica de envio
    console.log('Dados do formulário:', formData);
  };

  return (
    <div style={{ padding: 'var(--spacing-xl)' }}>
      <h2 style={{ color: 'var(--text-color)', marginBottom: 'var(--spacing-lg)' }}>
        Exemplo de Validação em Tempo Real
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gap: 'var(--spacing-md)',
          maxWidth: '500px'
        }}>
          <FormField
            label="Nome"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            error={errors.name}
            required
            placeholder="Digite seu nome completo"
            minLength={2}
            maxLength={100}
          />

          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            error={errors.email}
            required
            placeholder="exemplo@email.com"
          />

          <FormField
            label="Senha"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            error={errors.password}
            required
            placeholder="Mínimo 4 caracteres"
            minLength={4}
          />

          <FormField
            label="Tipo"
            type="select"
            name="type"
            value={formData.type}
            onChange={handleChange('type')}
            onBlur={handleBlur('type')}
            error={errors.type}
            required
            options={[
              { value: 'user', label: 'Usuário' },
              { value: 'admin', label: 'Administrador' }
            ]}
          />

          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-lg)'
          }}>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                padding: 'var(--spacing-md)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: 'var(--font-size-medium)',
                minHeight: '44px'
              }}
            >
              Enviar
            </button>
            
            <button
              type="button"
              onClick={clearErrors}
              style={{
                backgroundColor: 'var(--secondary-color)',
                color: 'white',
                border: 'none',
                padding: 'var(--spacing-md)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: 'var(--font-size-medium)',
                minHeight: '44px'
              }}
            >
              Limpar Erros
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ValidationExample;

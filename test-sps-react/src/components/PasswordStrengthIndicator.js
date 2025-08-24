import React, { useState, useEffect } from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback([]);
      return;
    }

    const checks = [];
    let score = 0;

    // Comprimento mínimo
    if (password.length >= 8) {
      score += 20;
      checks.push('✓ Pelo menos 8 caracteres');
    } else {
      checks.push('✗ Pelo menos 8 caracteres');
    }

    // Letra maiúscula
    if (/[A-Z]/.test(password)) {
      score += 20;
      checks.push('✓ Letra maiúscula');
    } else {
      checks.push('✗ Letra maiúscula');
    }

    // Letra minúscula
    if (/[a-z]/.test(password)) {
      score += 20;
      checks.push('✓ Letra minúscula');
    } else {
      checks.push('✗ Letra minúscula');
    }

    // Número
    if (/\d/.test(password)) {
      score += 20;
      checks.push('✓ Número');
    } else {
      checks.push('✗ Número');
    }

    // Caractere especial
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
      checks.push('✓ Caractere especial');
    } else {
      checks.push('✗ Caractere especial');
    }

    // Verificar senhas comuns
    const commonPasswords = [
      '1234', '12345', '123456', '1234567', '12345678', '123456789', '1234567890',
      'password', 'senha', 'admin', 'user', 'test', 'qwerty', 'abc123',
      'admin123', 'user123', 'test123', 'password123', 'senha123'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      score = Math.max(0, score - 40);
      checks.push('⚠️ Senha muito comum');
    } else {
      checks.push('✓ Senha não é comum');
    }

    // Verificar caracteres sequenciais
    const hasSequentialChars = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|890)/i.test(password);
    if (hasSequentialChars) {
      score = Math.max(0, score - 20);
      checks.push('⚠️ Evite sequências');
    } else {
      checks.push('✓ Sem sequências');
    }

    // Verificar caracteres repetidos
    const hasRepeatedChars = /(.)\1{2,}/.test(password);
    if (hasRepeatedChars) {
      score = Math.max(0, score - 20);
      checks.push('⚠️ Evite caracteres repetidos');
    } else {
      checks.push('✓ Sem caracteres repetidos');
    }

    setStrength(Math.min(100, Math.max(0, score)));
    setFeedback(checks);
  }, [password]);

  const getStrengthColor = () => {
    if (strength >= 80) return 'var(--success-color)';
    if (strength >= 60) return 'var(--warning-color)';
    if (strength >= 40) return 'var(--danger-color)';
    return 'var(--text-secondary)';
  };

  const getStrengthText = () => {
    if (strength >= 80) return 'Forte';
    if (strength >= 60) return 'Média';
    if (strength >= 40) return 'Fraca';
    return 'Muito fraca';
  };

  if (!password) return null;

  return (
    <div style={{
      marginTop: 'var(--spacing-sm)',
      padding: 'var(--spacing-sm)',
      backgroundColor: 'var(--background-secondary)',
      borderRadius: '4px',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-xs)'
      }}>
        <div style={{
          flex: 1,
          height: '8px',
          backgroundColor: 'var(--border-color)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${strength}%`,
            height: '100%',
            backgroundColor: getStrengthColor(),
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }} />
        </div>
        <span style={{
          fontSize: 'var(--font-size-small)',
          color: getStrengthColor(),
          fontWeight: 'bold',
          minWidth: '60px'
        }}>
          {getStrengthText()}
        </span>
      </div>
      
      <div style={{
        fontSize: 'var(--font-size-small)',
        color: 'var(--text-secondary)'
      }}>
        {feedback.map((item, index) => (
          <div key={index} style={{
            marginBottom: '2px',
            fontSize: 'var(--font-size-small)'
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;

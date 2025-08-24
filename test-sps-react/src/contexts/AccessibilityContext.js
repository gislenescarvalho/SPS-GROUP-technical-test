import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('accessibility-theme');
    const savedFontSize = localStorage.getItem('accessibility-fontSize');
    const savedHighContrast = localStorage.getItem('accessibility-highContrast');
    const savedReducedMotion = localStorage.getItem('accessibility-reducedMotion');

    if (savedTheme) setTheme(savedTheme);
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--theme', theme);
  }, [theme]);

  useEffect(() => {
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    
    document.documentElement.style.setProperty('--font-size-base', fontSizes[fontSize]);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('accessibility-theme', theme);
    localStorage.setItem('accessibility-fontSize', fontSize);
    localStorage.setItem('accessibility-highContrast', highContrast);
    localStorage.setItem('accessibility-reducedMotion', reducedMotion);
  }, [theme, fontSize, highContrast, reducedMotion]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const increaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  const getAccessibilityStyles = () => {
    const styles = {
      '--font-size-small': '14px',
      '--font-size-medium': '16px',
      '--font-size-large': '18px',
      '--font-size-xlarge': '20px',
      '--font-size-base': fontSize === 'small' ? '14px' : 
                          fontSize === 'medium' ? '16px' : 
                          fontSize === 'large' ? '18px' : '20px',
      '--line-height': '1.5',
      '--letter-spacing': '0.5px',
      '--border-radius': '4px',
      '--transition-speed': reducedMotion ? '0s' : '0.3s',
      '--focus-outline': highContrast ? '3px solid #000' : '2px solid #007bff',
      '--focus-outline-offset': '2px',
      '--color-primary': theme === 'dark' ? '#4a9eff' : '#007bff',
      '--color-secondary': theme === 'dark' ? '#6c757d' : '#6c757d',
      '--color-success': theme === 'dark' ? '#28a745' : '#28a745',
      '--color-danger': theme === 'dark' ? '#dc3545' : '#dc3545',
      '--color-warning': theme === 'dark' ? '#ffc107' : '#ffc107',
      '--color-info': theme === 'dark' ? '#17a2b8' : '#17a2b8',
      '--color-light': theme === 'dark' ? '#343a40' : '#f8f9fa',
      '--color-dark': theme === 'dark' ? '#f8f9fa' : '#343a40',
      '--color-background': theme === 'dark' ? '#121212' : '#ffffff',
      '--color-surface': theme === 'dark' ? '#1e1e1e' : '#f8f9fa',
      '--color-text': theme === 'dark' ? '#ffffff' : '#212529',
      '--color-text-muted': theme === 'dark' ? '#adb5bd' : '#6c757d',
      '--color-border': theme === 'dark' ? '#495057' : '#dee2e6',
      '--color-shadow': theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
      '--spacing-xs': '4px',
      '--spacing-sm': '8px',
      '--spacing-md': '16px',
      '--spacing-lg': '24px',
      '--spacing-xl': '32px',
      '--spacing-xxl': '48px'
    };

    if (highContrast) {
      styles['--color-primary'] = '#000000';
      styles['--color-text'] = '#000000';
      styles['--color-background'] = '#ffffff';
      styles['--color-border'] = '#000000';
      styles['--focus-outline'] = '3px solid #000000';
    }

    return styles;
  };

  const value = {
    theme,
    fontSize,
    highContrast,
    reducedMotion,
    toggleTheme,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    getAccessibilityStyles
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};


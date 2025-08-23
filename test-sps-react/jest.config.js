module.exports = {
  // Diretório raiz dos testes
  testEnvironment: 'jsdom',
  
  // Arquivos de setup
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Padrões de arquivos para incluir/excluir
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Diretórios a serem ignorados
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/'
  ],
  
  // Transformações
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Módulos para mock
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
  },
  
  // Configurações de cobertura
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js',
  ],
  
  // Thresholds de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Configurações de watch
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Configurações de verbose
  verbose: true,
  
  // Configurações de timeout
  testTimeout: 10000,
  
  // Configurações de globals
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};

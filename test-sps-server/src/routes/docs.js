const { Router } = require('express');
const swaggerUi = require('swagger-ui-express');
const specs = require('../config/swagger');

const docsRoutes = Router();

// Configuração do Swagger UI
const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SPS Group API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
};

// Rota principal da documentação
docsRoutes.use('/', swaggerUi.serve);
docsRoutes.get('/', swaggerUi.setup(specs, swaggerOptions));

// Rota para especificação JSON
docsRoutes.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Rota para especificação YAML
docsRoutes.get('/yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.send(specs);
});

module.exports = docsRoutes;


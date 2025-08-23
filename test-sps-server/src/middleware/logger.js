const logger = require('../utils/logger');

// Middleware para logging de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Interceptar o final da resposta
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(req, res, duration);
  });
  
  next();
};

module.exports = requestLogger;

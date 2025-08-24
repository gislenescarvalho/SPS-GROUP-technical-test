const express = require("express");
const helmet = require("helmet");
const routes = require("./routes");
const cors = require("cors");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const config = require("./config");
const { 
  corsOptions, 
  helmetConfig, 
  rateLimit, 
  removeSensitiveHeaders 
} = require("./middleware/security");
const { metricsMiddleware, cacheMetricsMiddleware } = require("./middleware/metrics");
const redisService = require("./services/redisService");

const app = express();

app.disable('x-powered-by');

app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(removeSensitiveHeaders);
app.use(rateLimit);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);

app.use(metricsMiddleware);
app.use(cacheMetricsMiddleware);

app.use((err, req, res, next) => {
  if (err.message === 'Não permitido pelo CORS') {
    return res.status(403).json({
      error: 'Origem não permitida',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  next(err);
});

app.use('/api', routes);

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

async function startServer() {
  try {
    await redisService.connect();
    
    app.listen(config.server.port, () => {
      console.log(`🚀 Server is running on http://${config.server.host}:${config.server.port}`);
      console.log(`🔒 Security headers enabled`);
      console.log(`🌐 CORS configured for allowed origins`);
      console.log(`⚡ Rate limiting enabled (${config.rateLimit.max} req/${config.rateLimit.windowMs / 60000}min)`);
      console.log(`📊 Metrics enabled: ${config.metrics.enabled}`);
      console.log(`🔗 Redis connected: ${redisService.isConnected}`);
      console.log(`📝 Environment: ${config.server.env}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

startServer();

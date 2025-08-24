require('dotenv').config();

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



const app = express();

app.disable('x-powered-by');

// Configurar limite de headers para evitar erro 431
app.use((req, res, next) => {
  // Monitorar headers apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development' && req.headers && Object.keys(req.headers).length > 30) {
    console.warn('⚠️ Muitos headers detectados:', Object.keys(req.headers).length);
  }
  next();
});

app.use(helmet(helmetConfig));
app.use(cors(corsOptions));
app.use(removeSensitiveHeaders);
app.use(rateLimit);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);



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

// Adicionar middleware para debug de CORS (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`🔍 ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
  });
}

// Configurar CORS para todas as rotas
app.options('*', cors(corsOptions));

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
    // Configurar servidor HTTP otimizado
    const server = require('http').createServer({
      maxHeaderSize: 16384, // Reduzido para 16KB (padrão mais comum)
      keepAliveTimeout: 5000, // Reduzir timeout para melhor performance
      headersTimeout: 4000
    }, app);
    
    server.listen(config.server.port, () => {
      console.log(`🚀 Server is running on http://${config.server.host}:${config.server.port}`);
      console.log(`🔒 Security headers enabled`);
      console.log(`🌐 CORS configured for allowed origins`);
      console.log(`⚡ Rate limiting enabled (${config.rateLimit.max} req/${config.rateLimit.windowMs / 60000}min)`);
      console.log(`📝 Environment: ${config.server.env}`);
      console.log(`📏 Max header size: 32KB`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

startServer();

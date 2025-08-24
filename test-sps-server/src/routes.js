const { Router } = require('express');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const metricsRoutes = require('./routes/metrics');
const auditRoutes = require('./routes/audit');
const versionRoutes = require('./routes/version');
const docsRoutes = require('./routes/docs');
const APIVersioning = require('./middleware/versioning');

const routes = Router();

routes.use(APIVersioning.detectVersion);
routes.use(APIVersioning.addVersionInfo);

routes.use('/docs', docsRoutes);

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/metrics', metricsRoutes);

routes.use('/audit', 
  APIVersioning.requireFeature('audit_logs'),
  auditRoutes
);

routes.use('/version', versionRoutes);

routes.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    version: req.apiVersion || APIVersioning.DEFAULT_VERSION,
    timestamp: new Date().toISOString()
  });
});

routes.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SPS Group API',
    version: APIVersioning.getVersionInfo(req.apiVersion),
    endpoints: {
      auth: '/auth',
      users: '/users',
      metrics: '/metrics',
      audit: '/audit (V2)',
      version: '/version',
      docs: '/docs'
    },
    documentation: '/docs'
  });
});

module.exports = routes;

const { Router } = require('express');
const auditController = require('../controllers/auditController');
const { authenticateToken } = require('../middleware/auth');

const auditRoutes = Router();

// Aplicar middleware de autenticação em todas as rotas
auditRoutes.use(authenticateToken);

// GET /audit - Obter logs de auditoria
auditRoutes.get('/', auditController.getAuditLogs);

// GET /audit/stats - Obter estatísticas de auditoria
auditRoutes.get('/stats', auditController.getAuditStats);

// GET /audit/export - Exportar logs de auditoria
auditRoutes.get('/export', auditController.exportAuditLogs);

// POST /audit/cleanup - Limpar logs antigos
auditRoutes.post('/cleanup', auditController.cleanupAuditLogs);

// GET /audit/user/:userId - Obter logs de um usuário específico
auditRoutes.get('/user/:userId', auditController.getUserAuditLogs);

// GET /audit/action/:action - Obter logs por ação
auditRoutes.get('/action/:action', auditController.getActionAuditLogs);

module.exports = auditRoutes;


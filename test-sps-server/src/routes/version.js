const { Router } = require('express');
const versionController = require('../controllers/versionController');
const APIVersioning = require('../middleware/versioning');

const versionRoutes = Router();

// Aplicar middleware de versionamento
versionRoutes.use(APIVersioning.detectVersion);
versionRoutes.use(APIVersioning.addVersionInfo);

// GET /version - Obter informações da versão atual
versionRoutes.get('/', versionController.getVersionInfo);

// GET /version/all - Obter todas as versões disponíveis
versionRoutes.get('/all', versionController.getAllVersions);

// GET /version/changelog - Obter changelog das versões
versionRoutes.get('/changelog', versionController.getChangelog);

// GET /version/health - Obter status de saúde da API
versionRoutes.get('/health', versionController.getHealth);

module.exports = versionRoutes;


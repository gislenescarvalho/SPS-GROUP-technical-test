const APIVersioning = require('../middleware/versioning');

class VersionController {
  // Obter informações da versão atual
  async getVersionInfo(req, res, next) {
    try {
      const version = req.apiVersion || APIVersioning.DEFAULT_VERSION;
      const info = APIVersioning.getVersionInfo(version);
      
      res.json({
        success: true,
        data: {
          ...info,
          server: {
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter todas as versões disponíveis
  async getAllVersions(req, res, next) {
    try {
      const versions = APIVersioning.getAllVersions();
      
      res.json({
        success: true,
        data: {
          versions,
          defaultVersion: APIVersioning.DEFAULT_VERSION,
          currentVersion: req.apiVersion || APIVersioning.DEFAULT_VERSION
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter changelog das versões
  async getChangelog(req, res, next) {
    try {
      const changelog = {
        'v1': {
          version: '1.0.0',
          releaseDate: '2024-01-01',
          features: [
            'Autenticação básica com JWT',
            'Gerenciamento de usuários (CRUD)',
            'Sistema de métricas básico',
            'Rate limiting',
            'Cache básico'
          ],
          improvements: [
            'Configuração centralizada',
            'Validação robusta',
            'Tratamento de erros melhorado'
          ]
        },
        'v2': {
          version: '2.0.0',
          releaseDate: '2024-12-01',
          features: [
            'Refresh tokens para renovação automática',
            'Sistema completo de audit logs',
            'Paginação avançada com filtros',
            'Cache inteligente por rota',
            'Métricas detalhadas de performance',
            'Versionamento de API'
          ],
          improvements: [
            'Performance otimizada com cache',
            'Segurança reforçada',
            'Monitoramento avançado',
            'Documentação automática'
          ],
          breakingChanges: [
            'Novos endpoints para refresh tokens',
            'Estrutura de resposta modificada para incluir version info',
            'Novos headers de API versioning'
          ]
        }
      };
      
      res.json({
        success: true,
        data: {
          changelog,
          currentVersion: req.apiVersion || APIVersioning.DEFAULT_VERSION
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter status de saúde da API
  async getHealth(req, res, next) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: req.apiVersion || APIVersioning.DEFAULT_VERSION,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage(),
        features: APIVersioning.getVersionInfo(req.apiVersion).features
      };
      
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VersionController();


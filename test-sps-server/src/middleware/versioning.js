const config = require('../config');

class APIVersioning {
  // Versões suportadas
  static VERSIONS = {
    V1: 'v1',
    V2: 'v2'
  };

  // Versão padrão
  static DEFAULT_VERSION = APIVersioning.VERSIONS.V1;

  // Configuração de versões
  static VERSION_CONFIG = {
    [APIVersioning.VERSIONS.V1]: {
      deprecated: false,
      sunsetDate: null,
      features: ['basic_auth', 'user_management']
    },
    [APIVersioning.VERSIONS.V2]: {
      deprecated: false,
      sunsetDate: null,
      features: ['basic_auth', 'user_management', 'refresh_tokens', 'audit_logs', 'advanced_pagination']
    }
  };

  // Middleware para detectar versão da API
  static detectVersion(req, res, next) {
    // Detectar versão por header
    const versionHeader = req.headers['x-api-version'] || req.headers['accept-version'];
    
    // Detectar versão por URL - melhorar regex para ser mais específica
    const urlVersion = req.path.match(/^\/api\/(v\d+)\//);
    
    // Detectar versão por query parameter
    const queryVersion = req.query.version;
    
    // Prioridade: URL > Header > Query > Default
    let version = urlVersion ? urlVersion[1] : 
                  versionHeader ? versionHeader : 
                  queryVersion ? queryVersion : 
                  APIVersioning.DEFAULT_VERSION;

    // Normalizar versão
    version = version.toLowerCase();
    
    // Verificar se versão é suportada
    if (!Object.values(APIVersioning.VERSIONS).includes(version)) {
      return res.status(400).json({
        success: false,
        error: 'Versão da API não suportada',
        supportedVersions: Object.values(APIVersioning.VERSIONS),
        defaultVersion: APIVersioning.DEFAULT_VERSION
      });
    }

    // Adicionar versão ao request
    req.apiVersion = version;
    
    // Adicionar headers informativos
    res.setHeader('X-API-Version', version);
    res.setHeader('X-API-Default-Version', APIVersioning.DEFAULT_VERSION);
    
    // Verificar se versão está deprecated
    const versionConfig = APIVersioning.VERSION_CONFIG[version];
    if (versionConfig.deprecated) {
      res.setHeader('X-API-Deprecated', 'true');
      if (versionConfig.sunsetDate) {
        res.setHeader('X-API-Sunset-Date', versionConfig.sunsetDate);
      }
    }

    next();
  }

  // Middleware para verificar feature disponível na versão
  static requireFeature(feature) {
    return (req, res, next) => {
      const version = req.apiVersion || APIVersioning.DEFAULT_VERSION;
      const versionConfig = APIVersioning.VERSION_CONFIG[version];
      
      if (!versionConfig.features.includes(feature)) {
        return res.status(400).json({
          success: false,
          error: `Feature '${feature}' não disponível na versão ${version}`,
          availableFeatures: versionConfig.features,
          currentVersion: version
        });
      }
      
      next();
    };
  }

  // Middleware para redirecionar versão deprecated
  static redirectDeprecated(req, res, next) {
    const version = req.apiVersion || APIVersioning.DEFAULT_VERSION;
    const versionConfig = APIVersioning.VERSION_CONFIG[version];
    
    if (versionConfig.deprecated) {
      // Redirecionar para versão mais recente
      const latestVersion = Object.keys(APIVersioning.VERSION_CONFIG)
        .filter(v => !APIVersioning.VERSION_CONFIG[v].deprecated)
        .pop();
      
      if (latestVersion && latestVersion !== version) {
        const newPath = req.path.replace(`/api/${version}/`, `/api/${latestVersion}/`);
        return res.redirect(301, newPath);
      }
    }
    
    next();
  }

  // Obter informações de versão
  static getVersionInfo(version = null) {
    const targetVersion = version || APIVersioning.DEFAULT_VERSION;
    const config = APIVersioning.VERSION_CONFIG[targetVersion];
    
    return {
      version: targetVersion,
      deprecated: config.deprecated,
      sunsetDate: config.sunsetDate,
      features: config.features,
      isDefault: targetVersion === APIVersioning.DEFAULT_VERSION
    };
  }

  // Obter todas as versões disponíveis
  static getAllVersions() {
    return Object.keys(APIVersioning.VERSION_CONFIG).map(version => ({
      version,
      ...APIVersioning.getVersionInfo(version)
    }));
  }

  // Middleware para adicionar informações de versão à resposta
  static addVersionInfo(req, res, next) {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Adicionar informações de versão se não existir
      if (data && typeof data === 'object' && !data.version) {
        data.version = APIVersioning.getVersionInfo(req.apiVersion);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  }
}

module.exports = APIVersioning;


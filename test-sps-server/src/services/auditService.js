const redisService = require('./redisService');
const config = require('../config');

class AuditService {
  // Níveis de severidade
  static SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  // Tipos de ação
  static ACTION_TYPES = {
    // Autenticação
    LOGIN: 'login',
    LOGOUT: 'logout',
    LOGIN_FAILED: 'login_failed',
    TOKEN_REFRESH: 'token_refresh',
    
    // Usuários
    USER_CREATED: 'user_created',
    USER_UPDATED: 'user_updated',
    USER_DELETED: 'user_deleted',
    USER_VIEWED: 'user_viewed',
    
    // Sistema
    CONFIG_CHANGED: 'config_changed',
    CACHE_CLEARED: 'cache_cleared',
    METRICS_EXPORTED: 'metrics_exported',
    
    // Segurança
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    UNAUTHORIZED_ACCESS: 'unauthorized_access',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity'
  };

  // Registrar log de auditoria
  async logAudit(data) {
    try {
      const auditEntry = {
        id: this.generateAuditId(),
        timestamp: new Date().toISOString(),
        userId: data.userId || null,
        userEmail: data.userEmail || null,
        userType: data.userType || null,
        action: data.action,
        resource: data.resource || null,
        resourceId: data.resourceId || null,
        details: data.details || {},
        severity: data.severity || AuditService.SEVERITY.MEDIUM,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        sessionId: data.sessionId || null,
        success: data.success !== false,
        errorMessage: data.errorMessage || null
      };

      // Armazenar no Redis com TTL baseado na severidade
      const ttl = this.getTTLBySeverity(auditEntry.severity);
      const key = `audit:${auditEntry.id}`;
      
      await redisService.set(key, JSON.stringify(auditEntry), ttl);
      
      // Adicionar à lista de logs por usuário (se aplicável)
      if (auditEntry.userId) {
        await this.addToUserLogs(auditEntry.userId, auditEntry.id, ttl);
      }

      // Adicionar à lista de logs por ação
      await this.addToActionLogs(auditEntry.action, auditEntry.id, ttl);

      // Registrar métrica
      await redisService.incrementMetric(`audit_${auditEntry.action}`);
      await redisService.incrementMetric(`audit_severity_${auditEntry.severity}`);

      // Log para console em desenvolvimento
      if (config.server.env === 'development') {
        console.log('📝 Audit Log:', {
          action: auditEntry.action,
          user: auditEntry.userEmail,
          severity: auditEntry.severity,
          success: auditEntry.success
        });
      }

      return auditEntry;
    } catch (error) {
      console.error('❌ Erro ao registrar audit log:', error.message);
      return null;
    }
  }

  // Gerar ID único para audit log
  generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obter TTL baseado na severidade
  getTTLBySeverity(severity) {
    const ttlMap = {
      [AuditService.SEVERITY.LOW]: 30 * 24 * 3600, // 30 dias
      [AuditService.SEVERITY.MEDIUM]: 90 * 24 * 3600, // 90 dias
      [AuditService.SEVERITY.HIGH]: 365 * 24 * 3600, // 1 ano
      [AuditService.SEVERITY.CRITICAL]: 5 * 365 * 24 * 3600 // 5 anos
    };
    
    return ttlMap[severity] || ttlMap[AuditService.SEVERITY.MEDIUM];
  }

  // Adicionar à lista de logs por usuário
  async addToUserLogs(userId, auditId, ttl) {
    try {
      const key = `user_audit:${userId}`;
      await redisService.lpush(key, auditId);
      await redisService.expire(key, ttl);
    } catch (error) {
      console.error('❌ Erro ao adicionar log do usuário:', error.message);
    }
  }

  // Adicionar à lista de logs por ação
  async addToActionLogs(action, auditId, ttl) {
    try {
      const key = `action_audit:${action}`;
      await redisService.lpush(key, auditId);
      await redisService.expire(key, ttl);
    } catch (error) {
      console.error('❌ Erro ao adicionar log da ação:', error.message);
    }
  }

  // Buscar logs de auditoria
  async getAuditLogs(filters = {}) {
    try {
      const {
        userId,
        action,
        severity,
        startDate,
        endDate,
        limit = 100,
        offset = 0
      } = filters;

      let auditIds = [];

      // Buscar por usuário
      if (userId) {
        const userLogs = await redisService.lrange(`user_audit:${userId}`, 0, -1);
        auditIds = userLogs;
      }
      // Buscar por ação
      else if (action) {
        const actionLogs = await redisService.lrange(`action_audit:${action}`, 0, -1);
        auditIds = actionLogs;
      }
      // Buscar todos (limitado)
      else {
        const keys = await redisService.keys('audit:*');
        auditIds = keys.slice(0, 1000); // Limitar para performance
      }

      // Buscar detalhes dos logs
      const logs = [];
      for (const id of auditIds.slice(offset, offset + limit)) {
        const auditKey = id.startsWith('audit:') ? id : `audit:${id}`;
        const logData = await redisService.get(auditKey);
        
        if (logData) {
          const log = JSON.parse(logData);
          
          // Aplicar filtros adicionais
          if (severity && log.severity !== severity) continue;
          if (startDate && new Date(log.timestamp) < new Date(startDate)) continue;
          if (endDate && new Date(log.timestamp) > new Date(endDate)) continue;
          
          logs.push(log);
        }
      }

      // Ordenar por timestamp (mais recente primeiro)
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return {
        logs,
        total: logs.length,
        limit,
        offset
      };
    } catch (error) {
      console.error('❌ Erro ao buscar logs de auditoria:', error.message);
      return { logs: [], total: 0, limit, offset: 0 };
    }
  }

  // Obter estatísticas de auditoria
  async getAuditStats() {
    try {
      const stats = await redisService.getMetrics([
        'audit_login',
        'audit_logout',
        'audit_login_failed',
        'audit_user_created',
        'audit_user_updated',
        'audit_user_deleted',
        'audit_severity_low',
        'audit_severity_medium',
        'audit_severity_high',
        'audit_severity_critical'
      ]);

      return {
        totalLogs: Object.values(stats).reduce((sum, val) => sum + (val || 0), 0),
        byAction: {
          logins: stats.audit_login || 0,
          logouts: stats.audit_logout || 0,
          failedLogins: stats.audit_login_failed || 0,
          userCreations: stats.audit_user_created || 0,
          userUpdates: stats.audit_user_updated || 0,
          userDeletions: stats.audit_user_deleted || 0
        },
        bySeverity: {
          low: stats.audit_severity_low || 0,
          medium: stats.audit_severity_medium || 0,
          high: stats.audit_severity_high || 0,
          critical: stats.audit_severity_critical || 0
        }
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de auditoria:', error.message);
      return {};
    }
  }

  // Limpar logs antigos
  async cleanupOldLogs() {
    try {
      // Esta funcionalidade seria implementada com um job agendado
      // Por enquanto, apenas log
      console.log('🧹 Limpeza de logs de auditoria antigos executada');
      await redisService.incrementMetric('audit_cleanup_runs');
    } catch (error) {
      console.error('❌ Erro na limpeza de logs:', error.message);
    }
  }

  // Métodos de conveniência para ações comuns
  async logLogin(userId, userEmail, userType, success, details = {}) {
    return this.logAudit({
      userId,
      userEmail,
      userType,
      action: success ? AuditService.ACTION_TYPES.LOGIN : AuditService.ACTION_TYPES.LOGIN_FAILED,
      resource: 'auth',
      severity: success ? AuditService.SEVERITY.LOW : AuditService.SEVERITY.MEDIUM,
      success,
      details
    });
  }

  async logUserAction(userId, userEmail, userType, action, resource, resourceId, details = {}) {
    return this.logAudit({
      userId,
      userEmail,
      userType,
      action,
      resource,
      resourceId,
      severity: AuditService.SEVERITY.MEDIUM,
      success: true,
      details
    });
  }

  async logSecurityEvent(userId, userEmail, userType, action, details = {}) {
    return this.logAudit({
      userId,
      userEmail,
      userType,
      action,
      resource: 'security',
      severity: AuditService.SEVERITY.HIGH,
      success: false,
      details
    });
  }
}

module.exports = new AuditService();


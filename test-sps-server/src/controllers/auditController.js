const auditService = require('../services/auditService');

class AuditController {
  // Obter logs de auditoria
  async getAuditLogs(req, res, next) {
    try {
      const {
        userId,
        action,
        severity,
        startDate,
        endDate,
        limit = 100,
        offset = 0
      } = req.query;

      const filters = {
        userId: userId ? parseInt(userId) : null,
        action,
        severity,
        startDate,
        endDate,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const result = await auditService.getAuditLogs(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter estatísticas de auditoria
  async getAuditStats(req, res, next) {
    try {
      const stats = await auditService.getAuditStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Limpar logs antigos
  async cleanupAuditLogs(req, res, next) {
    try {
      await auditService.cleanupOldLogs();
      
      res.json({
        success: true,
        message: 'Limpeza de logs de auditoria iniciada'
      });
    } catch (error) {
      next(error);
    }
  }

  // Exportar logs de auditoria
  async exportAuditLogs(req, res, next) {
    try {
      const { format = 'json' } = req.query;
      const filters = {
        userId: req.query.userId ? parseInt(req.query.userId) : null,
        action: req.query.action,
        severity: req.query.severity,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: 10000 // Limite maior para exportação
      };

      const result = await auditService.getAuditLogs(filters);

      if (format === 'csv') {
        // Gerar CSV
        const csv = this.generateCSV(result.logs);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
        res.send(csv);
      } else {
        // JSON padrão
        res.json({
          success: true,
          data: result,
          exportInfo: {
            format: 'json',
            timestamp: new Date().toISOString(),
            totalRecords: result.total
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Gerar CSV dos logs
  generateCSV(logs) {
    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'User Email',
      'User Type',
      'Action',
      'Resource',
      'Resource ID',
      'Severity',
      'Success',
      'IP Address',
      'User Agent'
    ];

    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.id,
        log.timestamp,
        log.userId || '',
        log.userEmail || '',
        log.userType || '',
        log.action,
        log.resource || '',
        log.resourceId || '',
        log.severity,
        log.success,
        log.ipAddress || '',
        log.userAgent || ''
      ].map(field => `"${field}"`).join(',');
      
      csvRows.push(row);
    });

    return csvRows.join('\n');
  }

  // Obter logs de um usuário específico
  async getUserAuditLogs(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const filters = {
        userId: parseInt(userId),
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const result = await auditService.getAuditLogs(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Obter logs por ação
  async getActionAuditLogs(req, res, next) {
    try {
      const { action } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const filters = {
        action,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const result = await auditService.getAuditLogs(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditController();


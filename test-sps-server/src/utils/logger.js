const config = require('../config');

// Logger simples configurável
class Logger {
  constructor() {
    this.silent = config.logging.silent;
    this.level = config.logging.level;
  }

  _shouldLog(level) {
    if (this.silent) return false;
    
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    return levels[level] <= levels[this.level];
  }

  _formatMessage(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  error(message, meta = {}) {
    if (this._shouldLog('error')) {
      console.error(this._formatMessage('error', message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this._shouldLog('warn')) {
      console.warn(this._formatMessage('warn', message, meta));
    }
  }

  info(message, meta = {}) {
    if (this._shouldLog('info')) {
      console.info(this._formatMessage('info', message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this._shouldLog('debug')) {
      console.debug(this._formatMessage('debug', message, meta));
    }
  }

  // Método para logs de requisição
  request(req, res, responseTime) {
    if (this._shouldLog('info')) {
      const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };

      this.info('HTTP Request', logData);
    }
  }

  // Método para logs de erro
  errorWithContext(error, req = null) {
    if (this._shouldLog('error')) {
      const logData = {
        message: error.message,
        stack: config.server.env === 'development' ? error.stack : undefined,
        ...(req && {
          method: req.method,
          url: req.url,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        })
      };

      this.error('Application Error', logData);
    }
  }
}

module.exports = new Logger();

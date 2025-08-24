const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Token de acesso necessário',
      timestamp: new Date().toISOString(),
      path: req.path || '/'
    });
  }

  const parts = authHeader.trim().split(/\s+/).filter(part => part.length > 0);
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ 
      error: 'Token de acesso necessário',
      timestamp: new Date().toISOString(),
      path: req.path || '/'
    });
  }

  const token = parts[1];

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token inválido ou expirado',
        timestamp: new Date().toISOString(),
        path: req.path || '/'
      });
    }
    req.user = user;
    next();
  });
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      type: user.type 
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

module.exports = {
  authenticateToken,
  generateToken
};

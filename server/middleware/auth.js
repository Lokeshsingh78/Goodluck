import jwt from 'jsonwebtoken';
import db from '../database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'goodluck_society_super_secret_jwt_key_2026';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Authentication token is missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, name, role, is_active FROM users WHERE id = ?').get(decoded.id);

    if (!user || user.is_active === 0) {
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
  }
  next();
};

export const optionalToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT id, email, name, role, is_active FROM users WHERE id = ?').get(decoded.id);
      if (user && user.is_active === 1) {
        req.user = user;
      }
    } catch (err) {
      // Ignore error for optional token
    }
  }
  next();
};

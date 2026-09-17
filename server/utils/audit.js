import db from '../database.js';
import { logger } from './logger.js';

export function logAdminAction(adminUser, action, entityType = null, entityId = null, details = null) {
  try {
    const adminId = adminUser ? adminUser.id : null;
    const adminEmail = adminUser ? adminUser.email : 'system';
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;

    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_email, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminId, adminEmail, action, entityType, entityId, detailsStr || '');

    logger.info(`Admin audit action logged: ${action} by ${adminEmail}`);
  } catch (err) {
    logger.error('Failed to write audit log entry', err);
  }
}

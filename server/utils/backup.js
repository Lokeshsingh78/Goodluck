import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../database.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

export async function createDatabaseBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `goodluck-backup-${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFileName);

    // Native WAL-safe sqlite backup method
    await db.backup(backupPath);

    logger.info(`Database backup created successfully: ${backupFileName}`);
    return {
      success: true,
      fileName: backupFileName,
      path: backupPath,
      createdAt: timestamp
    };
  } catch (err) {
    logger.error('Failed to create database backup', err);
    throw err;
  }
}

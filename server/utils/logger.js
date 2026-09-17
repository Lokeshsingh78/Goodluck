import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const SENSITIVE_KEYS = ['password', 'jwt_secret', 'cashfree_secret', 'webhook_secret', 'token', 'authorization', 'secret'];

function sanitize(data) {
  if (!data) return data;
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return data;

  const clean = Array.isArray(data) ? [] : {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export const logger = {
  info: (msg, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] ${msg}`, Object.keys(meta).length ? sanitize(meta) : '');
  },
  warn: (msg, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] [${timestamp}] ${msg}`, Object.keys(meta).length ? sanitize(meta) : '');
  },
  error: (msg, err = {}, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] ${msg}`, err.message || err, Object.keys(meta).length ? sanitize(meta) : '');
  }
};

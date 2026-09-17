import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

export default router;

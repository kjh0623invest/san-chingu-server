import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// GET /mountains?season=spring
router.get('/', async (req, res) => {
  try {
    const { season } = req.query;

    let sql = 'SELECT * FROM mountains';
    const params = [];

    if (season) {
      sql += ' WHERE season = $1';
      params.push(season);
    }

    sql += ' ORDER BY id';
    const result = await query(sql, params);

    res.json({
      count: result.rows.length,
      mountains: result.rows
    });
  } catch (err) {
    console.error('Mountains error:', err);
    res.status(500).json({ error: '산 목록 조회 중 오류 발생' });
  }
});

export default router;

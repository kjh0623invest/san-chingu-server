import express from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /market - 장터 목록
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM market_items WHERE status = $1 ORDER BY created_at DESC',
      ['available']
    );

    res.json({
      count: result.rows.length,
      items: result.rows
    });
  } catch (err) {
    console.error('Market error:', err);
    res.status(500).json({ error: '장터 목록 조회 중 오류 발생' });
  }
});

// POST /market - 장터 아이템 등록
router.post('/', auth, async (req, res) => {
  try {
    const { title, price, location, emoji } = req.body;
    const seller_id = req.user.id;

    if (!title || !price || !location) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다' });
    }

    const result = await query(
      'INSERT INTO market_items (title, price, location, emoji, seller_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, price, location, emoji || '📦', seller_id]
    );

    res.status(201).json({
      message: '아이템이 등록되었습니다',
      item: result.rows[0]
    });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: '아이템 등록 중 오류 발생' });
  }
});

// DELETE /market/:id - 장터 아이템 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const item_id = req.params.id;
    const user_id = req.user.id;

    // 아이템 소유자 확인
    const result = await query(
      'SELECT * FROM market_items WHERE id = $1',
      [item_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '아이템을 찾을 수 없습니다' });
    }

    const item = result.rows[0];

    if (item.seller_id !== user_id) {
      return res.status(403).json({ error: '삭제 권한이 없습니다' });
    }

    await query('DELETE FROM market_items WHERE id = $1', [item_id]);

    res.json({ message: '아이템이 삭제되었습니다' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: '아이템 삭제 중 오류 발생' });
  }
});

export default router;

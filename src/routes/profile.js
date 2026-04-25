import express from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /profile - 내 프로필
router.get('/', auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    // 사용자 정보
    const userResult = await query(
      'SELECT id, name, email, region, xp, level, temperature, monthly_hike_count, created_at FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    const user = userResult.rows[0];

    // 사용자 퀘스트 상태
    const questResult = await query(
      'SELECT q.*, uq.status FROM quests q LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = $1 ORDER BY q.zone, q.id',
      [user_id]
    );

    res.json({
      user,
      quests: questResult.rows
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: '프로필 조회 중 오류 발생' });
  }
});

// PATCH /profile - 프로필 수정
router.patch('/', auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, region } = req.body;

    const result = await query(
      'UPDATE users SET name = COALESCE($1, name), region = COALESCE($2, region) WHERE id = $3 RETURNING id, name, email, region, xp, level, temperature, monthly_hike_count',
      [name || null, region || null, user_id]
    );

    res.json({
      message: '프로필이 수정되었습니다',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: '프로필 수정 중 오류 발생' });
  }
});

export default router;

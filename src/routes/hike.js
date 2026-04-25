import express from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// POST /hike/certify - 등산 인증
router.post('/certify', auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { mountain_id, distance_km, steps } = req.body;

    if (distance_km === undefined || steps === undefined) {
      return res.status(400).json({ error: '거리와 걸음수는 필수입니다' });
    }

    // XP 계산: 기본 100 + 거리 기반(20/km) + 걸음 기반(1/100steps)
    const xp_earned = Math.floor(100 + distance_km * 20 + steps / 100);

    // 산행 기록 저장
    await query(
      'INSERT INTO hike_records (user_id, mountain_id, distance_km, steps, xp_earned) VALUES ($1, $2, $3, $4, $5)',
      [user_id, mountain_id || null, distance_km, steps, xp_earned]
    );

    // 사용자 XP 업데이트
    await query(
      'UPDATE users SET xp = xp + $1, monthly_hike_count = monthly_hike_count + 1 WHERE id = $2',
      [xp_earned, user_id]
    );

    // 레벨 업데이트 (50 XP당 1레벨)
    const levelMap = [
      { min: 0, level: '입문' },
      { min: 200, level: '성장' },
      { min: 500, level: '고수' },
      { min: 1000, level: '전문가' },
      { min: 2000, level: '신선' }
    ];

    const userResult = await query('SELECT xp FROM users WHERE id = $1', [user_id]);
    const totalXp = userResult.rows[0].xp;

    const newLevel = levelMap.reverse().find(l => totalXp >= l.min)?.level || '입문';

    await query('UPDATE users SET level = $1 WHERE id = $2', [newLevel, user_id]);

    // 최신 사용자 정보 반환
    const updatedUser = await query(
      'SELECT id, name, xp, level, monthly_hike_count FROM users WHERE id = $1',
      [user_id]
    );

    res.json({
      message: '등산 인증이 완료되었습니다',
      xp_earned,
      user: updatedUser.rows[0]
    });
  } catch (err) {
    console.error('Certify hike error:', err);
    res.status(500).json({ error: '등산 인증 중 오류 발생' });
  }
});

export default router;

import express from 'express';
import { query } from '../config/db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /meetings - 모임 목록 (인원 포함)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT m.*,
             COUNT(mm.user_id) as current
      FROM meetings m
      LEFT JOIN meeting_members mm ON m.id = mm.meeting_id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);

    res.json({
      count: result.rows.length,
      meetings: result.rows
    });
  } catch (err) {
    console.error('Meetings error:', err);
    res.status(500).json({ error: '모임 목록 조회 중 오류 발생' });
  }
});

// POST /meetings - 모임 생성
router.post('/', auth, async (req, res) => {
  try {
    const { title, course, max_members, mountain_id, meet_date } = req.body;
    const creator_id = req.user.id;

    if (!title || !course || !max_members) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다' });
    }

    const result = await query(
      'INSERT INTO meetings (title, course, max_members, creator_id, mountain_id, meet_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, course, max_members, creator_id, mountain_id, meet_date]
    );

    const meeting = result.rows[0];

    // 생성자 자동 참여
    await query(
      'INSERT INTO meeting_members (meeting_id, user_id) VALUES ($1, $2)',
      [meeting.id, creator_id]
    );

    res.status(201).json({
      message: '모임이 생성되었습니다',
      meeting: { ...meeting, current: 1 }
    });
  } catch (err) {
    console.error('Create meeting error:', err);
    res.status(500).json({ error: '모임 생성 중 오류 발생' });
  }
});

// POST /meetings/:id/join - 모임 참여
router.post('/:id/join', auth, async (req, res) => {
  try {
    const meeting_id = req.params.id;
    const user_id = req.user.id;

    // 모임 정보 조회
    const meetingResult = await query(
      'SELECT m.*, COUNT(mm.user_id) as current FROM meetings m LEFT JOIN meeting_members mm ON m.id = mm.meeting_id WHERE m.id = $1 GROUP BY m.id',
      [meeting_id]
    );

    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ error: '모임을 찾을 수 없습니다' });
    }

    const meeting = meetingResult.rows[0];

    // 이미 참여했는지 확인
    const memberCheck = await query(
      'SELECT * FROM meeting_members WHERE meeting_id = $1 AND user_id = $2',
      [meeting_id, user_id]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(409).json({ error: '이미 참여한 모임입니다' });
    }

    // 인원 확인
    if (meeting.current >= meeting.max_members) {
      return res.status(409).json({ error: '모임 인원이 가득 찼습니다' });
    }

    // 참여 추가
    await query(
      'INSERT INTO meeting_members (meeting_id, user_id) VALUES ($1, $2)',
      [meeting_id, user_id]
    );

    res.json({ message: '모임에 참여했습니다' });
  } catch (err) {
    console.error('Join meeting error:', err);
    res.status(500).json({ error: '모임 참여 중 오류 발생' });
  }
});

export default router;

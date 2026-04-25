import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const router = express.Router();

// POST /auth/register - 회원가입
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, region } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: '이름, 이메일, 비밀번호는 필수입니다' });
    }

    // 이메일 중복 체크
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: '이미 가입된 이메일입니다' });
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const result = await query(
      'INSERT INTO users (name, email, password, region) VALUES ($1, $2, $3, $4) RETURNING id, name, email, region',
      [name, email, hashedPassword, region || '미설정']
    );

    const user = result.rows[0];

    // JWT 토큰 발급
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: '회원가입 성공',
      token,
      user: { id: user.id, name: user.name, email: user.email, region: user.region }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: '회원가입 중 오류 발생' });
  }
});

// POST /auth/login - 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호는 필수입니다' });
    }

    // 사용자 조회
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다' });
    }

    const user = result.rows[0];

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다' });
    }

    // JWT 토큰 발급
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        region: user.region,
        xp: user.xp,
        level: user.level,
        temperature: user.temperature
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '로그인 중 오류 발생' });
  }
});

export default router;

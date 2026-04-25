import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import { initDatabase } from './db/init.js';

const app = express();
const httpServer = createServer(app);

// 데이터베이스 초기화
await initDatabase();

// Socket.io 설정
export const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://kjh0623invest.github.io',
      'http://localhost:5173',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 미들웨어
app.use(cors({
  origin: [
    'https://kjh0623invest.github.io',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 라우터 임포트
import authRouter from './routes/auth.js';
import mountainsRouter from './routes/mountains.js';
import meetingsRouter from './routes/meetings.js';
import marketRouter from './routes/market.js';
import profileRouter from './routes/profile.js';
import hikeRouter from './routes/hike.js';
import { initSocket } from './config/socket.js';

app.use('/auth', authRouter);
app.use('/mountains', mountainsRouter);
app.use('/meetings', meetingsRouter);
app.use('/market', marketRouter);
app.use('/profile', profileRouter);
app.use('/hike', hikeRouter);

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Socket.io 초기화
initSocket(io);

// 서버 시작
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✓ 서버 실행 중: http://localhost:${PORT}`);
  console.log(`✓ 환경: ${process.env.NODE_ENV}`);
});

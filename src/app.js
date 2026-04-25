import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

const app = express();
const httpServer = createServer(app);

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

// Socket.io 연결 처리
io.on('connection', (socket) => {
  console.log('새로운 클라이언트 연결:', socket.id);

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제:', socket.id);
  });

  // 추후 채팅 이벤트 추가
});

// 서버 시작
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✓ 서버 실행 중: http://localhost:${PORT}`);
  console.log(`✓ 환경: ${process.env.NODE_ENV}`);
});

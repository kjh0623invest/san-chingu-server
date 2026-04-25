import jwt from 'jsonwebtoken';
import { query } from './db.js';

export function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('새로운 클라이언트 연결:', socket.id);

    // 채팅방 입장
    socket.on('join_room', async (data) => {
      try {
        const { chatId, token } = data;

        // JWT 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.email = decoded.email;

        // 채팅방 참여 확인
        const chatResult = await query(
          'SELECT * FROM chats WHERE id = $1',
          [chatId]
        );

        if (chatResult.rows.length === 0) {
          socket.emit('error', { message: '채팅방을 찾을 수 없습니다' });
          return;
        }

        // Socket room 입장
        socket.join(`chat_${chatId}`);
        console.log(`사용자 ${socket.userId}가 채팅방 ${chatId}에 입장`);

        socket.emit('joined', {
          message: '채팅방에 입장했습니다',
          chatId,
          userId: socket.userId
        });
      } catch (err) {
        console.error('Join room error:', err);
        socket.emit('error', { message: '인증 오류' });
      }
    });

    // 메시지 전송
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content } = data;

        if (!socket.userId) {
          socket.emit('error', { message: '인증이 필요합니다' });
          return;
        }

        if (!content || content.trim() === '') {
          socket.emit('error', { message: '빈 메시지는 전송할 수 없습니다' });
          return;
        }

        // 메시지 DB에 저장
        const result = await query(
          'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id, sender_id, content, created_at',
          [chatId, socket.userId, content.trim()]
        );

        const message = result.rows[0];

        // 같은 채팅방의 모든 사용자에게 메시지 전송
        io.to(`chat_${chatId}`).emit('message_received', {
          id: message.id,
          chatId,
          senderId: message.sender_id,
          senderEmail: socket.email,
          content: message.content,
          timestamp: message.created_at
        });

        console.log(`메시지 저장됨: ${message.id} (채팅방: ${chatId})`);
      } catch (err) {
        console.error('Send message error:', err);
        socket.emit('error', { message: '메시지 전송 중 오류 발생' });
      }
    });

    // 메시지 이력 조회
    socket.on('get_messages', async (data) => {
      try {
        const { chatId, limit = 50 } = data;

        if (!socket.userId) {
          socket.emit('error', { message: '인증이 필요합니다' });
          return;
        }

        const result = await query(
          'SELECT m.id, m.chat_id, m.sender_id, u.email as senderEmail, m.content, m.created_at FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.chat_id = $1 ORDER BY m.created_at DESC LIMIT $2',
          [chatId, limit]
        );

        socket.emit('messages_history', {
          chatId,
          messages: result.rows.reverse()
        });
      } catch (err) {
        console.error('Get messages error:', err);
        socket.emit('error', { message: '메시지 조회 중 오류 발생' });
      }
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('클라이언트 연결 해제:', socket.id);
    });

    // 에러 처리
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
}

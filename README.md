# 산친구 백엔드 서버

액티브 시니어 등산 매칭 플랫폼의 Node.js + Express 백엔드 서버입니다.

## 기술 스택
- **런타임**: Node.js (ESM)
- **프레임워크**: Express.js
- **데이터베이스**: PostgreSQL
- **인증**: JWT + bcryptjs
- **실시간**: Socket.io
- **배포**: Railway

## 설치

```bash
npm install
```

## 환경변수 설정

`.env` 파일을 생성하고 다음을 입력하세요:

```
DATABASE_URL=postgresql://user:password@localhost:5432/san_chingu
JWT_SECRET=your_secret_key
PORT=3000
NODE_ENV=development
```

## 개발 서버 실행

```bash
npm run dev    # --watch 모드로 실행
npm start      # 프로덕션 모드
```

서버는 `http://localhost:3000`에서 실행됩니다.

## 헬스 체크

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2026-04-25T..."}
```

## Railway 배포

### 1. Railway 프로젝트 생성
- railway.app에서 "New Project" 선택
- GitHub 레포 연결

### 2. PostgreSQL 플러그인 추가
- "Add Plugin" → PostgreSQL 선택
- DATABASE_URL은 자동 주입됨

### 3. 환경변수 설정
- JWT_SECRET: 임의의 32자 이상 문자열
- NODE_ENV: production

### 4. 데이터베이스 스키마 초기화
Railway DB Connect 탭에서 `src/db/schema.sql` 실행

### 5. 배포 확인
발급된 도메인에서 `/health` 접속

## API 엔드포인트

개발 진행 중...

## 개발 단계

- [x] Phase 1: 기반 설정
- [ ] Phase 2: 인증 시스템
- [ ] Phase 3: 핵심 API
- [ ] Phase 4: 실시간 채팅
- [ ] Phase 5: 프론트엔드 연동

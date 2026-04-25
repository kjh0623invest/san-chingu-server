-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  region      VARCHAR(50),
  xp          INTEGER      DEFAULT 0,
  level       VARCHAR(20)  DEFAULT '입문',
  temperature NUMERIC(4,1) DEFAULT 36.5,
  monthly_hike_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ========== MOUNTAINS ==========
CREATE TABLE IF NOT EXISTS mountains (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  region      VARCHAR(50),
  level       VARCHAR(10),
  level_class VARCHAR(10),
  duration    VARCHAR(20),
  season      VARCHAR(10),
  tag         VARCHAR(50),
  emoji       VARCHAR(10),
  img_url     TEXT
);

-- ========== MEETINGS ==========
CREATE TABLE IF NOT EXISTS meetings (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  course      VARCHAR(200),
  max_members INTEGER NOT NULL DEFAULT 4,
  status      VARCHAR(20)  DEFAULT 'normal',
  img_url     TEXT,
  creator_id  INTEGER REFERENCES users(id),
  mountain_id INTEGER REFERENCES mountains(id),
  meet_date   DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ========== MEETING_MEMBERS ==========
CREATE TABLE IF NOT EXISTS meeting_members (
  meeting_id  INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id)    ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (meeting_id, user_id)
);

-- ========== MARKET_ITEMS ==========
CREATE TABLE IF NOT EXISTS market_items (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  price       INTEGER      NOT NULL,
  location    VARCHAR(100),
  img_url     TEXT,
  emoji       VARCHAR(10),
  seller_id   INTEGER REFERENCES users(id),
  status      VARCHAR(20) DEFAULT 'available',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ========== CHATS ==========
CREATE TABLE IF NOT EXISTS chats (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200),
  icon        VARCHAR(10),
  type        VARCHAR(20) DEFAULT 'group',
  meeting_id  INTEGER REFERENCES meetings(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ========== CHAT_MEMBERS ==========
CREATE TABLE IF NOT EXISTS chat_members (
  chat_id     INTEGER REFERENCES chats(id)    ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id)    ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

-- ========== MESSAGES ==========
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  chat_id     INTEGER REFERENCES chats(id)    ON DELETE CASCADE,
  sender_id   INTEGER REFERENCES users(id),
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ========== QUESTS ==========
CREATE TABLE IF NOT EXISTS quests (
  id          SERIAL PRIMARY KEY,
  label       VARCHAR(100) NOT NULL,
  xp_reward   INTEGER NOT NULL,
  icon        VARCHAR(10),
  zone        VARCHAR(20),
  trigger_type VARCHAR(50)
);

-- ========== USER_QUESTS ==========
CREATE TABLE IF NOT EXISTS user_quests (
  user_id     INTEGER REFERENCES users(id)    ON DELETE CASCADE,
  quest_id    INTEGER REFERENCES quests(id)   ON DELETE CASCADE,
  status      VARCHAR(20) DEFAULT 'locked',
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, quest_id)
);

-- ========== HIKE_RECORDS ==========
CREATE TABLE IF NOT EXISTS hike_records (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id)    ON DELETE CASCADE,
  mountain_id INTEGER REFERENCES mountains(id),
  distance_km NUMERIC(6,3) DEFAULT 0,
  steps       INTEGER       DEFAULT 0,
  xp_earned   INTEGER       DEFAULT 0,
  hike_date   DATE          NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- ========== 초기 데이터: MOUNTAINS (16개 산) ==========
INSERT INTO mountains (name, region, level, level_class, duration, season, tag, emoji, img_url)
VALUES
-- SPRING
('진해 장복산', '경남', '쉬움', 'easy', '1.5시간', 'spring', '🌸 벚꽃', '🌸', 'https://images.unsplash.com/photo-1490750967868-88df5691cc4f?w=400&h=280&fit=crop&q=85'),
('황매산', '경남', '보통', 'medium', '3시간', 'spring', '🌺 철쭉', '🌺', 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=400&h=280&fit=crop&q=85'),
('광양 백운산', '전남', '보통', 'medium', '3시간', 'spring', '🌸 매화', '🌸', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop&q=85'),
('여수 영취산', '전남', '보통', 'medium', '2.5시간', 'spring', '🌷 진달래', '🌷', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop&q=85'),
-- SUMMER
('지리산', '전남/경남', '어려움', 'hard', '6시간', 'summer', '🌊 계곡', '🌊', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=280&fit=crop&q=85'),
('설악산', '강원', '어려움', 'hard', '7시간', 'summer', '🌿 녹음', '🌿', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop&q=85'),
('가야산', '경남', '보통', 'medium', '4시간', 'summer', '💧 폭포', '💧', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=280&fit=crop&q=85'),
('오대산', '강원', '보통', 'medium', '4시간', 'summer', '🌳 비밀숲', '🌳', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop&q=85'),
-- AUTUMN
('내장산', '전북/충남', '보통', 'medium', '3시간', 'autumn', '🍁 단풍', '🍁', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop&q=85'),
('설악산', '강원', '어려움', 'hard', '7시간', 'autumn', '🍁 단풍', '🍁', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop&q=85'),
('치악산', '강원', '보통', 'medium', '4시간', 'autumn', '🍂 단풍', '🍂', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop&q=85'),
('북한산', '서울', '보통', 'medium', '4시간', 'autumn', '🍁 단풍', '🍁', 'https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e?w=400&h=280&fit=crop&q=85'),
-- WINTER
('덕유산', '전북/경남', '보통', 'medium', '4시간', 'winter', '❄️ 눈꽃', '❄️', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=280&fit=crop&q=85'),
('태백산', '강원', '보통', 'medium', '3시간', 'winter', '❄️ 눈꽃', '❄️', 'https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e?w=400&h=280&fit=crop&q=85'),
('한라산', '제주', '어려움', 'hard', '9시간', 'winter', '❄️ 설경', '❄️', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop&q=85'),
('소백산', '충북/강원', '보통', 'medium', '4시간', 'winter', '❄️ 눈꽃', '❄️', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop&q=85')
ON CONFLICT DO NOTHING;

-- ========== 초기 데이터: QUESTS (32개 퀘스트) ==========
INSERT INTO quests (label, xp_reward, icon, zone, trigger_type)
VALUES
('첫 걸음 내딛기', 50, '🌱', '입문', 'manual'),
('프로필 완성', 50, '📝', '입문', 'manual'),
('첫 번째 모임 구경', 100, '👀', '입문', 'manual'),
('아차산 완등', 150, '⛰️', '입문', 'hike_count'),
('첫 동행 신청', 200, '🤝', '입문', 'meeting_join'),
('장터 구경하기', 100, '🛍️', '입문', 'market_view'),
('북한산 둘레길 산책', 300, '🌲', '성장', 'hike_count'),
('산친구 3명 사귀기', 200, '👥', '성장', 'friend_count'),
('연속 2회 등산 인증', 250, '🔥', '성장', 'consecutive_hikes'),
('장터 첫 거래 완료', 300, '🛒', '성장', 'market_trade'),
('모임 개설하기', 400, '📣', '성장', 'create_meeting'),
('북한산 대장정 완등', 500, '🏔️', '성장', 'hike_count'),
('한 달 4회 산행 달성', 400, '📅', '고수', 'monthly_hikes'),
('등산 리뷰 작성', 150, '✍️', '고수', 'write_review'),
('산친구 10명 사귀기', 500, '🫂', '고수', 'friend_count'),
('채팅 50회 달성', 200, '💬', '고수', 'chat_count'),
('설악산 완등', 600, '❄️', '고수', 'hike_count'),
('장터 5회 거래 달성', 400, '💰', '고수', 'market_trades'),
('등산 사진 5장 공유', 200, '📸', '고수', 'photo_share'),
('지리산 1박 2일 완등', 800, '⛺', '고수', 'hike_count'),
('연속 3개월 목표 달성', 600, '🏅', '전문가', 'monthly_goal'),
('산친구 온도 40도 달성', 500, '🌡️', '전문가', 'temperature'),
('모임장 5회 데뷔', 700, '👨‍✈️', '전문가', 'host_meetings'),
('내장산 단풍 시즌 완등', 600, '🍁', '전문가', 'seasonal_hike'),
('대청봉(설악) 등정 완료', 800, '🗻', '전문가', 'hike_count'),
('장터 거래 15회 달성', 600, '🏪', '전문가', 'market_trades'),
('백두대간 1구간 종주', 1000, '🗺️', '전문가', 'long_trail'),
('연간 산행 48회 달성', 1000, '📆', '신선', 'annual_hikes'),
('전국 명산 10개 완등', 1200, '🏆', '신선', 'famous_mountains'),
('산친구 50명 사귀기', 800, '🌟', '신선', 'friend_count'),
('한라산 백록담 완등', 1500, '🌋', '신선', 'hike_count'),
('전설의 한라산 신선 등극', 2000, '👑', '신선', 'legendary')
ON CONFLICT DO NOTHING;

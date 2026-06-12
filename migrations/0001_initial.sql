-- 연세온치과 — 조회수 집계 (봇 제외 실측: is_bot 기록 후 사람 트래픽만 집계)
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL,   -- 'case' | 'column' | 'notice'
  content_id TEXT NOT NULL,
  is_bot INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pv_content ON page_views(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_pv_human ON page_views(content_type, content_id, is_bot);

-- 예약 백업용 (R2가 주 저장소, D1은 빠른 조회용 인덱스)
CREATE TABLE IF NOT EXISTS reservation_index (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  treatment TEXT,
  status TEXT DEFAULT 'new',    -- new | confirmed | done | cancel
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

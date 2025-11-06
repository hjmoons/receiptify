import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// data 폴더 확인 및 생성
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'receiptify.db');
console.log('📁 Database path:', dbPath);

const db = new Database(dbPath);

// 성능 최적화
db.pragma('journal_mode = WAL');

// 즉시 테이블 생성!
db.exec(`
  -- 사용자 테이블
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 자산 테이블 (카드, 계좌 등)
  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('card', 'account')),
    balance INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    name TEXT NOT NULL,
    type INTEGER NOT NULL CHECK (type IN (0, 1)), -- 0: 지출, 1: 수입
    level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
    user_id INTEGER NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

  -- 수입/지출 내역 테이블
  CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type INTEGER NOT NULL CHECK (type IN (0, 1, 2)), -- 0: expenditure, 1: income, 2: transfer
      cost INTEGER NOT NULL,
      content TEXT,
      location TEXT,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP, -- 거래 발생 날짜/시간
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER NOT NULL,
      asset_id INTEGER NOT NULL,
      trs_asset_id INTEGER,
      category_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (trs_asset_id) REFERENCES assets(id) on DELETE SET NULL
  );

  -- 통계 테이블
  CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount INTEGER NOT NULL,
      month TEXT NOT NULL,
      year TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      asset_id INTEGER NOT NULL,
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
  );

  -- 인덱스 생성 (성능 최적화)
  CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
  CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
  CREATE INDEX IF NOT EXISTS idx_receipts_asset_id ON receipts(asset_id);
  CREATE INDEX IF NOT EXISTS idx_receipts_category_id ON receipts(category_id);
  CREATE INDEX IF NOT EXISTS idx_receipts_transaction_date ON receipts(transaction_date);
  CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);
  CREATE INDEX IF NOT EXISTS idx_statistics_asset_id ON statistics(asset_id);
  CREATE INDEX IF NOT EXISTS idx_statistics_year_month ON statistics(year, month);

  -- 트리거 생성 (updated_at 자동 업데이트)
  CREATE TRIGGER IF NOT EXISTS update_assets_updated_at 
      AFTER UPDATE ON assets
      FOR EACH ROW
      BEGIN
          UPDATE assets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

  CREATE TRIGGER IF NOT EXISTS update_receipts_updated_at 
      AFTER UPDATE ON receipts
      FOR EACH ROW
      BEGIN
          UPDATE receipts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

  CREATE TRIGGER IF NOT EXISTS update_statistics_updated_at 
      AFTER UPDATE ON statistics
      FOR EACH ROW
      BEGIN
          UPDATE statistics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
`);

console.log('✅ Database initialized');

// 테이블 확인
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('📋 Tables:', tables.map((t: any) => t.name).join(', '));

export default db;
const Database = require('better-sqlite3');
const path = require('path');

// DB 파일 경로 설정
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/var/lib/receiptify/receiptify.db'  // 운영 서버 경로
  : path.join(__dirname, '../../data/receiptify.db');  // 개발 경로

// DB 연결
const db = new Database(dbPath);

// 성능 최적화 설정
db.pragma('journal_mode = WAL');  // Write-Ahead Logging
db.pragma('busy_timeout = 5000');  // 5초 대기
db.pragma('synchronous = NORMAL'); // 성능/안정성 균형

// 테이블 초기화
const initDB = () => {
  db.exec(`
    -- 사용자 테이블
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 영수증 테이블
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      store_name TEXT NOT NULL,
      total_amount REAL NOT NULL,
      receipt_date DATE DEFAULT CURRENT_DATE,
      image_path TEXT,
      ocr_text TEXT,
      parsed_data TEXT, -- JSON 형태로 저장
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- 영수증 항목 테이블
    CREATE TABLE IF NOT EXISTS receipt_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (receipt_id) REFERENCES receipts (id) ON DELETE CASCADE
    );

    -- 인덱스 생성 (조회 성능 향상)
    CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
    CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(receipt_date);
    CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
  `);
};

module.exports = { db, initDB };
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
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    store_name TEXT NOT NULL,
    total_amount REAL NOT NULL,
    receipt_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

console.log('✅ Database initialized');

// 테이블 확인
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('📋 Tables:', tables.map((t: any) => t.name).join(', '));

export default db;
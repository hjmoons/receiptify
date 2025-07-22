import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/receiptify.db');
const db = new Database(dbPath);

// 성능 최적화
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

export const initDB = () => {
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

  console.log('Database initialized');
};

export default db;
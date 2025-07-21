const { db } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

const backup = () => {
  const date = new Date().toISOString().split('T')[0];
  const backupPath = path.join(process.env.DB_BACKUP_PATH, `backup-${date}.db`);
  
  // SQLite 백업 API 사용
  db.backup(backupPath)
    .then(() => {
      console.log(`백업 완료: ${backupPath}`);
    })
    .catch(console.error);
};

// 매일 새벽 3시 백업 (cron으로 실행)
backup();
// src/utils/dbStats.js
const getDBStats = () => {
  const stats = db.prepare('SELECT * FROM sqlite_stat1').all();
  const size = db.prepare("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").get();
  
  return {
    tableStats: stats,
    dbSize: size.size,
    inMemory: db.memory,
    readonly: db.readonly
  };
};
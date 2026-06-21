const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config');
const logger = require('../utils/logger');

const dbPath = config.database.path;
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error(`数据库连接失败: ${err.message}`, 'DB');
    process.exit(1);
  }
  logger.info('数据库连接成功', 'DB');
});

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`DROP TABLE IF EXISTS articles`);
      db.run(`DROP TABLE IF EXISTS trends`);
      db.run(`DROP TABLE IF EXISTS categories`);

      db.run(`
        CREATE TABLE articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          url TEXT NOT NULL UNIQUE,
          source TEXT NOT NULL,
          published_at TEXT,
          fetched_at TEXT DEFAULT CURRENT_TIMESTAMP,
          tags TEXT
        )
      `);

      db.run(`
        CREATE TABLE trends (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          keyword TEXT NOT NULL,
          count INTEGER DEFAULT 0,
          trend_score REAL DEFAULT 0,
          date TEXT NOT NULL,
          UNIQUE(keyword, date)
        )
      `);

      logger.info('数据库表初始化完成', 'DB');
      resolve();
    });
  });
};

module.exports = {
  db,
  initDatabase,
};
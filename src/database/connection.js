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
      db.run(`
        CREATE TABLE IF NOT EXISTS articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          url TEXT NOT NULL UNIQUE,
          source TEXT NOT NULL,
          category TEXT DEFAULT 'general',
          content TEXT,
          summary TEXT,
          published_at TEXT,
          fetched_at TEXT DEFAULT CURRENT_TIMESTAMP,
          tags TEXT,
          image_url TEXT,
          author TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS trends (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          keyword TEXT NOT NULL,
          count INTEGER DEFAULT 0,
          trend_score REAL DEFAULT 0,
          date TEXT NOT NULL,
          UNIQUE(keyword, date)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT DEFAULT '#3B82F6'
        )
      `);

      const defaultCategories = [
        { name: '大模型', description: 'GPT、LLaMA等大型语言模型相关' },
        { name: 'AI应用', description: '人工智能在各行业的应用' },
        { name: '研究进展', description: '最新AI研究成果' },
        { name: '政策法规', description: 'AI相关政策和法规' },
        { name: '行业动态', description: 'AI行业新闻和动态' },
        { name: '技术教程', description: 'AI技术教程和指南' },
        { name: '安全伦理', description: 'AI安全和伦理问题' },
      ];

      defaultCategories.forEach((category) => {
        db.run(
          'INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)',
          [category.name, category.description]
        );
      });

      logger.info('数据库表初始化完成', 'DB');
      resolve();
    });
  });
};

module.exports = {
  db,
  initDatabase,
};
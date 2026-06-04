const { db } = require('../database/connection');
const logger = require('../utils/logger');

const Article = {
  create: (article) => {
    return new Promise((resolve, reject) => {
      const {
        title,
        url,
        source,
        category = 'general',
        content = null,
        summary = null,
        published_at = null,
        tags = null,
        image_url = null,
        author = null,
      } = article;

      db.run(
        `INSERT OR IGNORE INTO articles 
          (title, url, source, category, content, summary, published_at, tags, image_url, author)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, url, source, category, content, summary, published_at, tags, image_url, author],
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              logger.info(`文章已存在: ${url}`, 'MODEL');
              resolve({ id: null, created: false });
            } else {
              logger.error(`创建文章失败: ${err.message}`, 'MODEL');
              reject(err);
            }
          } else {
            resolve({ id: this.lastID, created: true });
          }
        }
      );
    });
  },

  findAll: (options = {}) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM articles';
      const params = [];
      const conditions = [];

      if (options.keyword) {
        conditions.push('title LIKE ?');
        params.push(`%${options.keyword}%`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY published_at DESC, fetched_at DESC';

      if (options.limit) {
        query += ' LIMIT ?';
        params.push(options.limit);
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          logger.error(`查询文章失败: ${err.message}`, 'MODEL');
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  deleteOldArticles: (days) => {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM articles WHERE fetched_at < date('now', '-${days} days')`,
        function (err) {
          if (err) {
            logger.error(`删除过期文章失败: ${err.message}`, 'MODEL');
            reject(err);
          } else {
            logger.info(`删除了 ${this.changes} 篇过期文章`, 'MODEL');
            resolve({ deleted: this.changes });
          }
        }
      );
    });
  },
};

module.exports = Article;
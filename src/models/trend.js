const { db } = require('../database/connection');
const logger = require('../utils/logger');

const Trend = {
  createOrUpdate: (keyword, count, date = null) => {
    return new Promise((resolve, reject) => {
      const currentDate = date || new Date().toISOString().split('T')[0];

      db.run(
        `INSERT OR REPLACE INTO trends (keyword, count, date) 
          VALUES (?, ?, ?)`,
        [keyword, count, currentDate],
        function (err) {
          if (err) {
            logger.error(`创建/更新趋势失败: ${err.message}`, 'MODEL');
            reject(err);
          } else {
            resolve({ id: this.lastID, updated: this.changes > 0 });
          }
        }
      );
    });
  },

  getRecentTrends: (days = 7) => {
    return new Promise((resolve, reject) => {
      const query = `
        WITH LatestTrends AS (
          SELECT keyword, count, date,
            ROW_NUMBER() OVER (PARTITION BY keyword ORDER BY date DESC) as rn
          FROM trends
          WHERE date >= date('now', '-${days} days')
        )
        SELECT keyword, count as total_count, date
        FROM LatestTrends
        WHERE rn = 1
        ORDER BY total_count DESC
        LIMIT 20
      `;
      db.all(query, (err, rows) => {
        if (err) {
          logger.error(`查询最近趋势失败: ${err.message}`, 'MODEL');
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  getTrendHistory: (keyword, days = 30) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT date, count
        FROM trends
        WHERE keyword = ? AND date >= date('now', '-${days} days')
        ORDER BY date ASC
      `;
      db.all(query, [keyword], (err, rows) => {
        if (err) {
          logger.error(`查询趋势历史失败: ${err.message}`, 'MODEL');
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  deleteOldTrends: (days = 90) => {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM trends WHERE date < date('now', '-${days} days')`,
        function (err) {
          if (err) {
            logger.error(`删除旧趋势失败: ${err.message}`, 'MODEL');
            reject(err);
          } else {
            resolve({ deleted: this.changes });
          }
        }
      );
    });
  },
};

module.exports = Trend;
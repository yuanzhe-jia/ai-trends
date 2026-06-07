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
      // 先尝试查询昨天的数据
      const queryYesterday = `
        SELECT keyword, count as total_count, date
        FROM trends
        WHERE date = date('now', '-1 day')
        ORDER BY total_count DESC
        LIMIT 20
      `;
      
      db.all(queryYesterday, (err, rows) => {
        if (err) {
          logger.error(`查询昨天趋势失败: ${err.message}`, 'MODEL');
          reject(err);
          return;
        }
        
        // 如果昨天有数据，直接返回
        if (rows.length > 0) {
          resolve(rows);
          return;
        }
        
        // 如果昨天没数据，查询最近一天有数据的
        const queryLatest = `
          SELECT keyword, count as total_count, date
          FROM trends
          WHERE date = (SELECT MAX(date) FROM trends)
          ORDER BY total_count DESC
          LIMIT 20
        `;
        
        db.all(queryLatest, (err2, rows2) => {
          if (err2) {
            logger.error(`查询最近趋势失败: ${err2.message}`, 'MODEL');
            reject(err2);
          } else {
            resolve(rows2);
          }
        });
      });
    });
  },

  hasTrendsForDate: (date) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) as count FROM trends WHERE date = ?`;
      db.get(query, [date], (err, row) => {
        if (err) {
          logger.error(`检查趋势数据失败: ${err.message}`, 'MODEL');
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  },

  findByDate: (date) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT keyword, count as total_count, date
        FROM trends
        WHERE date = ?
        ORDER BY total_count DESC
      `;
      db.all(query, [date], (err, rows) => {
        if (err) {
          logger.error(`查询指定日期趋势失败: ${err.message}`, 'MODEL');
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  getTrendHistory: (keyword, days = 30) => {
    return new Promise((resolve, reject) => {
      // 查询最近30天（包含今天）的所有可用数据
      // 不再排除今天，因为有些关键词可能只有今天的数据
      const query = `
        SELECT date, count
        FROM trends
        WHERE keyword = ? 
          AND date >= date('now', '-${days} days')
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
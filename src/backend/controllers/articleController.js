const Article = require('../models/article');
const logger = require('../utils/logger');

const articleController = {
  getAllArticles: async (req, res) => {
    try {
      const { keyword, limit, date } = req.query;
      const options = {
        keyword: keyword || undefined,
        date: date || undefined,
      };
      
      // 只有当明确提供了 limit 参数时才设置限制
      // 如果提供了关键词但没有提供 limit，则返回所有匹配的文章
      if (limit !== undefined && limit !== null && limit !== '') {
        options.limit = parseInt(limit);
      }
      
      const articles = await Article.findAll(options);
      
      res.json({
        success: true,
        data: articles,
        count: articles.length,
      });
    } catch (error) {
      logger.error(`获取文章列表失败: ${error.message}`, 'CONTROLLER');
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // 清理旧文章（只保留最新一天的文章）
  cleanupOldArticles: async (req, res) => {
    try {
      const deletedCount = await Article.cleanupOldArticles();
      
      res.json({
        success: true,
        deletedCount: deletedCount,
        message: `成功清理 ${deletedCount} 篇旧文章`,
      });
    } catch (error) {
      logger.error(`清理旧文章失败: ${error.message}`, 'CONTROLLER');
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = articleController;
const Article = require('../models/article');
const logger = require('../utils/logger');

const articleController = {
  getAllArticles: async (req, res) => {
    try {
      const { keyword, limit, date } = req.query;
      const options = {
        limit: parseInt(limit) || 50,
        keyword: keyword || undefined,
        date: date || undefined,
      };
      
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
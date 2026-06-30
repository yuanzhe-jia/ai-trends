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
};

module.exports = articleController;
const trendService = require('../services/trendService');
const logger = require('../utils/logger');

const trendController = {
  getRecentTrends: async (req, res) => {
    try {
      const { days } = req.query;
      const trends = await trendService.getRecentTrends(parseInt(days) || 7);
      
      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      logger.error(`获取趋势失败: ${error.message}`, 'CONTROLLER');
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getTrendHistory: async (req, res) => {
    try {
      const { keyword } = req.params;
      const { days } = req.query;
      const history = await trendService.getTrendHistory(keyword, parseInt(days) || 30);
      
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      logger.error(`获取趋势历史失败: ${error.message}`, 'CONTROLLER');
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  updateTrends: async (req, res) => {
    try {
      const trends = await trendService.updateTrends();
      
      res.json({
        success: true,
        data: trends,
        message: `成功更新 ${Object.keys(trends).length} 个趋势关键词`,
      });
    } catch (error) {
      logger.error(`更新趋势失败: ${error.message}`, 'CONTROLLER');
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = trendController;
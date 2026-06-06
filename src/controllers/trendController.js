const trendService = require('../services/trendService');
const logger = require('../utils/logger');

const trendController = {
  getRecentTrends: async (req, res) => {
    try {
      // 仅获取趋势数据，不自动更新（按需更新由前端手动触发）
      const trends = await trendService.getRecentTrends(7);
      
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
      // 从查询参数中获取日期，如果没有则使用默认值（昨天）
      const date = req.query.date || null;
      const trends = await trendService.updateTrends(date);
      
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
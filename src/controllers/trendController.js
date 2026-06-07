const trendService = require('../services/trendService');
const trendModel = require('../models/trend');
const logger = require('../utils/logger');

const trendController = {
  // 检查是否需要更新（当日第一次访问时）
  checkUpdate: async (req, res) => {
    try {
      // 获取昨天的日期
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // 检查数据库中是否已有昨天的趋势数据
      const yesterdayTrends = await trendModel.findByDate(yesterdayStr);
      
      // 如果没有昨天的数据，或者数据很少，就需要更新
      const needUpdate = !yesterdayTrends || yesterdayTrends.length < 3;
      
      res.json({
        success: true,
        needUpdate: needUpdate,
        latestDate: yesterdayTrends.length > 0 ? yesterdayStr : null,
      });
    } catch (error) {
      logger.error(`检查更新失败: ${error.message}`, 'CONTROLLER');
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

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
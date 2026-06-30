const trendService = require('../services/trendService');
const trendModel = require('../models/trend');
const logger = require('../utils/logger');

const trendController = {
  getRecentTrends: async (req, res) => {
    try {
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

  getMaxHeatInHistory: async (req, res) => {
    try {
      const maxHeat = await trendModel.getMaxHeatInHistory();
      
      res.json({
        success: true,
        data: maxHeat,
      });
    } catch (error) {
      logger.error(`获取历史最大热度失败: ${error.message}`, 'CONTROLLER');
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getLatestDate: async (req, res) => {
    try {
      const latest = await trendModel.getLatest();
      const latestDate = latest ? latest.date : null;
      
      res.json({
        success: true,
        data: latestDate,
      });
    } catch (error) {
      logger.error(`获取最新日期失败: ${error.message}`, 'CONTROLLER');
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = trendController;
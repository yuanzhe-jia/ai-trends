const express = require('express');
const articleController = require('../controllers/articleController');
const trendController = require('../controllers/trendController');
const rssService = require('../services/rssService');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to check database path
router.get('/debug/db', (req, res) => {
  const config = require('../config');
  res.json({ 
    dbPath: config.database.path,
    resolvedPath: require('path').resolve(config.database.path)
  });
});

router.get('/articles', articleController.getAllArticles);

router.get('/trends', trendController.getRecentTrends);
router.get('/trends/:keyword/history', trendController.getTrendHistory);
router.post('/trends/update', trendController.updateTrends);
router.post('/rss/update', async (req, res) => {
  try {
    const result = await rssService.fetchAllRssFeeds();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error(`RSS更新失败: ${error.message}`, 'ROUTE');
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
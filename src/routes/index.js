const express = require('express');
const articleController = require('../controllers/articleController');
const trendController = require('../controllers/trendController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/articles', articleController.getAllArticles);

router.get('/trends', trendController.getRecentTrends);
router.get('/trends/:keyword/history', trendController.getTrendHistory);

module.exports = router;
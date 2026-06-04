const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { initDatabase } = require('./database/connection');
const routes = require('./routes');
const logger = require('./utils/logger');
const rssService = require('./services/rssService');
const trendService = require('./services/trendService');
const Article = require('./models/article');
const Trend = require('./models/trend');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../app')));

app.use('/api', routes);

let dailyTaskTimeout = null;

const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
};

const executeDailyTasks = async () => {
  logger.info('定时任务: 开始每日数据更新', 'SCHEDULE');
  
  try {
    logger.info('定时任务: RSS抓取', 'SCHEDULE');
    await rssService.fetchAllRssFeeds();
    
    logger.info('定时任务: 更新趋势', 'SCHEDULE');
    await trendService.updateTrends();
    
    logger.info('定时任务: 清理过期数据', 'SCHEDULE');
    await Article.deleteOldArticles(config.dataRetentionDays);
    await Trend.deleteOldTrends(config.dataRetentionDays);
    
    logger.info('定时任务: 每日数据更新完成', 'SCHEDULE');
  } catch (error) {
    logger.error(`定时任务执行失败: ${error.message}`, 'SCHEDULE');
  }
  
  scheduleNextDailyTask();
};

const scheduleNextDailyTask = () => {
  const delay = getTimeUntilMidnight();
  logger.info(`定时任务: 下次执行时间 ${new Date(Date.now() + delay).toLocaleString('zh-CN')}`, 'SCHEDULE');
  dailyTaskTimeout = setTimeout(executeDailyTasks, delay);
};

const startScheduledTasks = () => {
  scheduleNextDailyTask();
  logger.info('定时任务已启动，每日0点自动更新', 'SCHEDULE');
};

const stopScheduledTasks = () => {
  if (dailyTaskTimeout) clearTimeout(dailyTaskTimeout);
  logger.info('定时任务已停止', 'SCHEDULE');
};

const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(config.port, () => {
      logger.info(`服务器启动成功，运行在 http://localhost:${config.port}`, 'SERVER');
    });

    startScheduledTasks();

    logger.info('应用初始化完成', 'SERVER');
  } catch (error) {
    logger.error(`服务器启动失败: ${error.message}`, 'SERVER');
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在关闭服务器', 'SERVER');
  stopScheduledTasks();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在关闭服务器', 'SERVER');
  stopScheduledTasks();
  process.exit(0);
});

startServer();

module.exports = app;
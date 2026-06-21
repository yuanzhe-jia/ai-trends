const rssService = require('./rssService');
const trendService = require('./trendService');
const logger = require('../utils/logger');

const runDailyUpdate = async () => {
  try {
    logger.info('=== 开始每日定时更新 ===', 'SCHEDULER');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    logger.info(`更新日期: ${dateStr}`, 'SCHEDULER');
    
    await rssService.fetchAllRssFeeds();
    logger.info('RSS抓取完成', 'SCHEDULER');
    
    await trendService.updateTrends(dateStr);
    logger.info('趋势分析完成', 'SCHEDULER');
    
    logger.info('=== 每日定时更新完成 ===', 'SCHEDULER');
  } catch (error) {
    logger.error(`每日定时更新失败: ${error.message}`, 'SCHEDULER');
    throw error;
  }
};

const startScheduler = () => {
  const schedule = require('node-schedule');
  
  const job = schedule.scheduleJob('0 0 3 * * *', async () => {
    logger.info('触发每日定时任务 (凌晨3:00)', 'SCHEDULER');
    await runDailyUpdate();
  });
  
  logger.info('定时任务已启动: 每日凌晨3:00自动更新', 'SCHEDULER');
  
  return job;
};

module.exports = {
  runDailyUpdate,
  startScheduler,
};
const rssService = require('./rssService');
const trendService = require('./trendService');
const Article = require('../models/article');
const Trend = require('../models/trend');
const logger = require('../utils/logger');

const runDailyUpdate = async () => {
  try {
    logger.info('=== 开始每日定时更新 ===', 'SCHEDULER');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    logger.info(`更新日期: ${dateStr}`, 'SCHEDULER');
    
    // 1. 抓取 RSS 订阅源
    await rssService.fetchAllRssFeeds();
    logger.info('RSS抓取完成', 'SCHEDULER');
    
    // 2. 更新趋势分析
    await trendService.updateTrends(dateStr);
    logger.info('趋势分析完成', 'SCHEDULER');
    
    // 3. 清理旧文章（只保留最新一天的文章）
    const deletedArticles = await Article.cleanupOldArticles();
    logger.info(`文章清理完成: 删除 ${deletedArticles} 篇旧文章`, 'SCHEDULER');
    
    // 4. 清理旧趋势数据（保留90天）
    const deletedTrends = await Trend.deleteOldTrends(90);
    logger.info(`趋势清理完成: 删除 ${deletedTrends.deleted} 天前的数据`, 'SCHEDULER');
    
    logger.info('=== 每日定时更新完成 ===', 'SCHEDULER');
  } catch (error) {
    logger.error(`每日定时更新失败: ${error.message}`, 'SCHEDULER');
    throw error;
  }
};

const checkAndCatchUpData = async () => {
  try {
    logger.info('=== 检查数据完整性 ===', 'SCHEDULER');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const hasYesterdayTrends = await Trend.hasTrendsForDate(yesterdayStr);
    
    if (!hasYesterdayTrends) {
      logger.warn(`检测到 ${yesterdayStr} 缺少趋势数据，开始补全`, 'SCHEDULER');
      await runDailyUpdate();
    } else {
      logger.info(`${yesterdayStr} 数据完整，无需补全`, 'SCHEDULER');
    }
  } catch (error) {
    logger.error(`数据补全检查失败: ${error.message}`, 'SCHEDULER');
  }
};

const startScheduler = async () => {
  await checkAndCatchUpData();

  const enabled = process.env.ENABLE_INTERNAL_SCHEDULER === 'true';

  if (!enabled) {
    logger.info('应用内定时任务已禁用（使用系统 cron 替代）', 'SCHEDULER');
    return null;
  }

  const schedule = require('node-schedule');

  const job = schedule.scheduleJob({
    hour: 3,
    minute: 0,
    second: 0,
    tz: 'Asia/Shanghai',
  }, async () => {
    logger.info('触发每日定时任务 (北京时间凌晨3:00)', 'SCHEDULER');
    await runDailyUpdate();
  });

  logger.info('定时任务已启动: 每日北京时间凌晨3:00自动更新', 'SCHEDULER');

  return job;
};

module.exports = {
  runDailyUpdate,
  startScheduler,
};
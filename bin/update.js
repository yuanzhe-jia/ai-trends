#!/usr/bin/env node

require('dotenv').config();

const { initDatabase } = require('../src/backend/database/connection');
const { runDailyUpdate } = require('../src/backend/services/scheduler');
const logger = require('../src/backend/utils/logger');

const main = async () => {
  try {
    logger.info('=== Cron 触发每日更新 ===', 'CRON');

    await initDatabase();
    logger.info('数据库初始化完成', 'CRON');

    await runDailyUpdate();

    logger.info('=== Cron 每日更新完成 ===', 'CRON');
    process.exit(0);
  } catch (error) {
    logger.error(`Cron 每日更新失败: ${error.message}`, 'CRON');
    process.exit(1);
  }
};

main();

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const config = require('./config');
const { initDatabase } = require('./database/connection');
const routes = require('./routes');
const logger = require('./utils/logger');
const { startScheduler } = require('./services/scheduler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api', routes);

const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(config.port, () => {
      logger.info(`服务器启动成功，运行在 http://localhost:${config.port}`, 'SERVER');
    });

    startScheduler();

    logger.info('应用初始化完成', 'SERVER');
  } catch (error) {
    logger.error(`服务器启动失败: ${error.message}`, 'SERVER');
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在关闭服务器', 'SERVER');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在关闭服务器', 'SERVER');
  process.exit(0);
});

startServer();

module.exports = app;
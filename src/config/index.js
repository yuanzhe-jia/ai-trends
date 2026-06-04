const path = require('path');

const config = {
  port: process.env.PORT || 3000,
  
  database: {
    type: 'sqlite',
    path: path.join(__dirname, '../data/database.sqlite'),
  },
  
  rssFeeds: [
    { name: '量子位', url: 'https://www.qbitai.com/feed' },
    { name: '掘金', url: 'https://juejin.cn/rss' },
    { name: '36氪', url: 'https://36kr.com/feed' },
  ],
  
  dataRetentionDays: 30,
};

module.exports = config;
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
    { name: '钛媒体', url: 'https://www.tmtpost.com/rss' },
    { name: '机器之心', url: 'https://www.jiqizhixin.com/rss' },
    { name: 'CSDN', url: 'https://blog.csdn.net/rss' },
    { name: 'OSCHINA', url: 'https://www.oschina.net/news/rss' },
    { name: '雷峰网', url: 'https://www.leiphone.com/feed' },
  ],
  
  dataRetentionDays: 30,
};

module.exports = config;
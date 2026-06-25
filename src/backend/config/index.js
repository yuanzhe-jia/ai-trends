const path = require('path');

const config = {
  port: process.env.PORT || 3000,
  
  database: {
    type: 'sqlite',
    path: path.join(__dirname, '../../../data/database.sqlite'),
  },
  
  rssFeeds: [
    { name: '量子位', url: 'https://www.qbitai.com/feed' },
    { name: '掘金', url: 'https://juejin.cn/rss' },
    { name: '36氪', url: 'https://36kr.com/feed' },
    { name: '钛媒体', url: 'https://www.tmtpost.com/rss' },
    { name: 'OSCHINA', url: 'https://www.oschina.net/news/rss' },
    { name: '雷峰网', url: 'https://www.leiphone.com/feed' },
    { name: '爱范儿', url: 'https://www.ifanr.com/feed' },
    { name: 'IT之家', url: 'https://www.ithome.com/rss/' },
    { name: '少数派', url: 'https://sspai.com/feed' },
  ],
  
  dataRetentionDays: 30,
};

module.exports = config;
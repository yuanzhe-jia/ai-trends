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
  
  // 豆包 LLM API 配置
  llm: {
    apiKey: process.env.DOUBAO_API_KEY || '',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-pro-32k',
  },
};

module.exports = config;
const axios = require('axios');
const xml2js = require('xml2js');
const config = require('../config');
const Article = require('../models/article');
const logger = require('../utils/logger');

const parseRssFeed = async (xmlString) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlString, { trim: true, explicitArray: false }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const extractArticlesFromFeed = (feedData, sourceName) => {
  const articles = [];
  
  if (feedData.rss && feedData.rss.channel) {
    const channel = feedData.rss.channel;
    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    
    items.forEach((item) => {
      const article = {
        title: item.title || '',
        url: item.link || item.guid || '',
        source: sourceName,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        tags: item.category ? (Array.isArray(item.category) ? item.category.join(',') : item.category) : null,
      };
      
      if (article.title && article.url) {
        articles.push(article);
      }
    });
  }
  
  return articles;
};

const fetchRssFeed = async (feedUrl, sourceName) => {
  try {
    logger.info(`正在抓取RSS源: ${sourceName}`, 'RSS');
    
    const response = await axios.get(feedUrl, {
      headers: {
        'User-Agent': 'AI-Trends-Bot/1.0',
      },
      timeout: 30000,
    });
    
    const feedData = await parseRssFeed(response.data);
    const articles = extractArticlesFromFeed(feedData, sourceName);
    
    logger.info(`从 ${sourceName} 获取到 ${articles.length} 篇文章`, 'RSS');
    
    return articles;
  } catch (error) {
    logger.error(`抓取RSS源失败 ${sourceName}: ${error.message}`, 'RSS');
    return [];
  }
};

const saveArticles = async (articles) => {
  const results = { created: 0, skipped: 0 };
  
  for (const article of articles) {
    try {
      const result = await Article.create(article);
      if (result.created) {
        results.created++;
      } else {
        results.skipped++;
      }
    } catch (error) {
      logger.error(`保存文章失败: ${article.url} - ${error.message}`, 'RSS');
      results.skipped++;
    }
  }
  
  return results;
};

const fetchAllRssFeeds = async () => {
  logger.info('开始抓取所有RSS源', 'RSS');
  
  const allResults = { totalCreated: 0, totalSkipped: 0 };
  
  for (const feed of config.rssFeeds) {
    const articles = await fetchRssFeed(feed.url, feed.name);
    const results = await saveArticles(articles);
    
    allResults.totalCreated += results.created;
    allResults.totalSkipped += results.skipped;
  }
  
  logger.info(`RSS抓取完成: 新增 ${allResults.totalCreated} 篇，跳过 ${allResults.totalSkipped} 篇`, 'RSS');
  
  return allResults;
};

module.exports = {
  fetchRssFeed,
  fetchAllRssFeeds,
  parseRssFeed,
};
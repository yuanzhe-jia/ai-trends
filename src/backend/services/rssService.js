const axios = require('axios');
const xml2js = require('xml2js');
const config = require('../config');
const Article = require('../models/article');
const logger = require('../utils/logger');

// 尝试用宽松选项解析XML，失败后返回null
const parseRssFeed = async (xmlString, strict = false) => {
  return new Promise((resolve) => {
    const options = strict
      ? { trim: true, explicitArray: false }
      : { trim: true, explicitArray: false, strict: false, normalizeTags: true };
    
    xml2js.parseString(xmlString, options, (err, result) => {
      if (err) {
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

// 清理常见XML错误
const sanitizeXml = (xmlString) => {
  return xmlString
    .replace(/&(?!(amp|lt|gt|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
};

// 将 RSS 中的各种日期格式转换为 SQLite 支持的 ISO 格式 (YYYY-MM-DD HH:MM:SS)
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const extractArticlesFromFeed = (feedData, sourceName) => {
  const articles = [];
  
  if (!feedData) return articles;
  
  // 支持多种RSS格式
  const channel = feedData.rss?.channel || feedData.feed;
  if (!channel) return articles;
  
  const items = Array.isArray(channel.item) ? channel.item : 
                Array.isArray(channel.entry) ? channel.entry :
                channel.item ? [channel.item] :
                channel.entry ? [channel.entry] : [];
  
  items.forEach((item) => {
    if (!item) return;
    
    const article = {
      title: item.title?._ || item.title || '',
      url: item.link?._ || item.link?.href || item.link || item.guid?._ || item.guid || '',
      source: sourceName,
      published_at: formatDate(item.pubDate?._ || item.pubDate || item.updated?._ || item.updated || item.published?._ || item.published || null),
      tags: item.category ? (Array.isArray(item.category) ? item.category.map(c => c._ || c).join(',') : (item.category._ || item.category)) : null,
    };
    
    if (article.title && article.url) {
      articles.push(article);
    }
  });
  
  return articles;
};

// 不同源使用不同请求策略
const getRequestConfig = (sourceName) => {
  const baseConfig = {
    timeout: 30000,
    responseType: 'text',
  };
  
  const configs = {
    '掘金': {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://juejin.cn/',
      },
      maxRedirects: 5,
    },
  };
  
  return { ...baseConfig, ...(configs[sourceName] || { headers: { 'User-Agent': 'AI-Trends-Bot/1.0' } }) };
};

const fetchRssFeed = async (feedUrl, sourceName, retries = 2) => {
  try {
    logger.info(`正在抓取RSS源: ${sourceName}`, 'RSS');
    
    const requestConfig = getRequestConfig(sourceName);
    const response = await axios.get(feedUrl, requestConfig);
    
    let xmlString = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    
    // 清理XML中的常见错误
    xmlString = sanitizeXml(xmlString);
    
    // 先尝试严格解析
    let feedData = await parseRssFeed(xmlString, true);
    
    // 严格解析失败，尝试宽松解析
    if (!feedData) {
      logger.warn(`${sourceName} 严格解析失败，尝试宽松解析`, 'RSS');
      feedData = await parseRssFeed(xmlString, false);
    }
    
    const articles = extractArticlesFromFeed(feedData, sourceName);
    
    if (articles.length === 0 && feedData) {
      logger.warn(`${sourceName} 解析成功但未提取到文章，尝试备用解析`, 'RSS');
    }
    
    logger.info(`从 ${sourceName} 获取到 ${articles.length} 篇文章`, 'RSS');
    
    return articles;
  } catch (error) {
    logger.error(`抓取RSS源失败 ${sourceName}: ${error.message}`, 'RSS');
    
    if (retries > 0) {
      logger.info(`${sourceName} 重试中... (${retries}次剩余)`, 'RSS');
      await new Promise(r => setTimeout(r, 2000));
      return fetchRssFeed(feedUrl, sourceName, retries - 1);
    }
    
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
const Article = require('../models/article');
const Trend = require('../models/trend');
const llmService = require('./llmService');
const logger = require('../utils/logger');

// AI相关关键词库（按类别分组）- 作为 fallback
const aiKeywords = [
  // 技术概念
  'GPT', 'LLM', '大模型', '人工智能', '机器学习', '深度学习',
  '神经网络', 'Transformer', 'NLP', '自然语言处理', '计算机视觉',
  '图像生成', '多模态', 'AGI', '通用人工智能', '强化学习', '数据科学',
  '微调', 'Prompt', '提示词', 'RAG', '检索增强',
  
  // 公司
  'OpenAI', 'Google', 'Meta', 'Microsoft', 'Anthropic', '字节', '阿里', 
  '百度', '腾讯', '华为', '英伟达',
  
  // 产品/服务
  'ChatGPT', 'Gemini', 'Claude', 'Codex', 'DALL-E', 'Stable Diffusion', 
  'MidJourney', '豆包', '通义千问', '文心一言', '混元', 'Kimi', 
  '火山引擎', 'Agent', 'Copilot',
  
  // 技术应用
  '智能助手', '聊天机器人', '自动驾驶', '机器人', 'AI安全', '伦理',
];

// 使用预定义关键词库统计每个关键词在标题中出现的文章数
const countArticlesWithKeyword = async (date) => {
  const articles = await Article.findAll({ date });
  
  if (articles.length === 0) {
    logger.warn('没有文章可分析', 'TREND');
    return {};
  }
  
  const keywordCounts = {};
  
  aiKeywords.forEach((keyword) => {
    const pattern = new RegExp(keyword, 'i');
    const count = articles.filter((article) => {
      const title = article.title || '';
      return pattern.test(title);
    }).length;
    
    if (count > 0) {
      keywordCounts[keyword] = count;
    }
  });
  
  return keywordCounts;
};

// 使用 LLM 从文章中提取关键词
const countArticlesWithLLM = async (date) => {
  const articles = await Article.findAll({ date });
  
  if (articles.length === 0) {
    logger.warn('没有文章可分析', 'TREND');
    return {};
  }
  
  return await llmService.extractKeywordsFromArticles(articles);
};

const analyzeTrendsFromArticles = async (date) => {
  try {
    // 使用预定义关键词库统计标题中关键词出现次数
    const keywordCounts = await countArticlesWithKeyword(date);
    
    const sortedKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return Object.fromEntries(sortedKeywords);
  } catch (error) {
    logger.error(`分析趋势失败: ${error.message}`, 'TREND');
    throw error;
  }
};

const updateTrends = async (date = null) => {
  try {
    logger.info('开始更新趋势数据', 'TREND');
    
    // 如果传入了日期参数则使用它，否则使用昨天的日期
    const dateStr = date || (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    })();
    
    // 分析指定日期的文章来生成关键词
    const trends = await analyzeTrendsFromArticles(dateStr);
    
    for (const [keyword, count] of Object.entries(trends)) {
      await Trend.createOrUpdate(keyword, count, dateStr);
    }
    
    await Trend.deleteOldTrends(90);
    
    logger.info(`趋势更新完成，共更新 ${Object.keys(trends).length} 个关键词`, 'TREND');
    
    return trends;
  } catch (error) {
    logger.error(`更新趋势失败: ${error.message}`, 'TREND');
    throw error;
  }
};

const getRecentTrends = async (days = 7) => {
  try {
    const trends = await Trend.getRecentTrends(days);
    return trends;
  } catch (error) {
    logger.error(`获取趋势失败: ${error.message}`, 'TREND');
    throw error;
  }
};

// 按需更新趋势数据：如果昨天没有数据，则抓取RSS并更新趋势
const checkAndUpdateTrends = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const hasData = await Trend.hasTrendsForDate(yesterdayStr);
    
    if (!hasData) {
      logger.info(`昨日(${yesterdayStr})无趋势数据，开始抓取RSS并更新`, 'TREND');
      
      // 动态导入 rssService 避免循环依赖
      const rssService = require('./rssService');
      await rssService.fetchAllRssFeeds();
      await updateTrends();
      
      logger.info(`按需更新完成`, 'TREND');
    } else {
      logger.info(`昨日(${yesterdayStr})已有趋势数据，无需更新`, 'TREND');
    }
    
    return await Trend.getRecentTrends(7);
  } catch (error) {
    logger.error(`按需更新趋势失败: ${error.message}`, 'TREND');
    throw error;
  }
};

const getTrendHistory = async (keyword, days = 30) => {
  try {
    const history = await Trend.getTrendHistory(keyword, days);
    return history;
  } catch (error) {
    logger.error(`获取趋势历史失败: ${error.message}`, 'TREND');
    throw error;
  }
};

module.exports = {
  analyzeTrendsFromArticles,
  updateTrends,
  getRecentTrends,
  checkAndUpdateTrends,
  getTrendHistory,
};

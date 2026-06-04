const Article = require('../models/article');
const Trend = require('../models/trend');
const logger = require('../utils/logger');

// AI相关关键词库（按类别分组）
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

// 统计每个关键词在标题中出现的文章数
const countArticlesWithKeyword = async () => {
  const articles = await Article.findAll();
  
  if (articles.length === 0) {
    logger.warn('没有文章可分析', 'TREND');
    return {};
  }
  
  const keywordCounts = {};
  
  aiKeywords.forEach((keyword) => {
    const pattern = new RegExp(keyword, 'i');
    const count = articles.filter((article) => {
      // 只在标题中匹配
      const title = article.title || '';
      return pattern.test(title);
    }).length;
    
    if (count > 0) {
      keywordCounts[keyword] = count;
    }
  });
  
  return keywordCounts;
};

const analyzeTrendsFromArticles = async () => {
  try {
    const keywordCounts = await countArticlesWithKeyword();
    
    const sortedKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return Object.fromEntries(sortedKeywords);
  } catch (error) {
    logger.error(`分析趋势失败: ${error.message}`, 'TREND');
    throw error;
  }
};

const updateTrends = async () => {
  try {
    logger.info('开始更新趋势数据', 'TREND');
    
    const trends = await analyzeTrendsFromArticles();
    const today = new Date().toISOString().split('T')[0];
    
    for (const [keyword, count] of Object.entries(trends)) {
      await Trend.createOrUpdate(keyword, count, today);
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
  getTrendHistory,
};

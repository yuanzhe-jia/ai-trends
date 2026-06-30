const Article = require('../models/article');
const Trend = require('../models/trend');
const config = require('../config');
const logger = require('../utils/logger');

// AI相关关键词库（按类别分组）
const aiKeywords = [
  // 技术概念 - 基础概念
  'AI', 'AGI', 'LLM', '大模型', '人工智能',
  '机器学习', '深度学习', '强化学习', '神经网络', 'Transformer',
  'NLP', '自然语言处理', 'CV', '计算机视觉', '图像生成',
  '多模态', '数据科学',

  // 技术概念 - 训练与微调
  '微调', 'Prompt', '提示词', 'RAG', '检索增强',
  '联邦学习', '迁移学习', '少样本学习', 'LoRA', 'RLHF',
  '提示工程', 'SFT',

  // 技术概念 - 模型架构
  '向量数据库', '知识图谱', '模型压缩', '模型蒸馏', 'MoE',
  '上下文', 'Attention', '注意力机制', 'Token', '词元',
  'Embedding', '词向量', '嵌入', '思维链', 'Agent',
  '智能体', 'Skill',

  // 技术概念 - XR 与数字人
  '数字孪生', '元宇宙', '空间计算', '虚拟现实',
  '增强现实', '混合现实', '数字人', '数字员工',

  // 公司 - 国际科技巨头
  'OpenAI', 'Google', '谷歌', 'Meta', 'Microsoft',
  '微软', 'Anthropic', 'Apple', '苹果', 'Amazon',
  '亚马逊', 'NVIDIA', '英伟达', 'Tesla', '特斯拉',

  // 公司 - 国内科技巨头
  '字节', '阿里', '百度', '腾讯', '华为',

  // 公司 - AI 独角兽
  'DeepSeek', '月之暗面', '智谱AI', '零一万物', '百川智能',
  'MiniMax', '商汤', '讯飞', '旷视',

  // 产品/服务 - GPT / OpenAI 系列
  'GPT', 'ChatGPT', 'DALL-E', 'Codex', 'Sora', 'Grok',

  // 产品/服务 - Gemini / Google
  'Gemini', 'Vertex AI', 'Adobe Firefly',

  // 产品/服务 - 图像生成
  'Midjourney', 'Stable Diffusion', 'Flux', 'Ideogram',
  'Nano Banana', 'Seedance', 'Seedream',

  // 产品/服务 - Claude / Anthropic
  'Claude', 'Claude Code',

  // 产品/服务 - 国内大模型产品
  '豆包', '千问', 'Qwen', '文心一言', 'ERNIE',
  '混元', 'Kimi', '火山引擎',

  // 产品/服务 - AI 编程工具
  'Copilot', 'Cursor', 'Windsurf', 'Trae', 'Replit',
  'Codeium', 'Tabnine', '通义灵码', '文心快码', 'CodeGeeX',
  'Fitten Code', 'Comate',

  // 产品/服务 - AI 平台与框架
  'LangChain', 'LlamaIndex', 'LangGraph', 'Opik', 'Langfuse',
  '轨迹评估',
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
    
    await Trend.deleteOldTrends(config.dataRetentionDays);
    
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

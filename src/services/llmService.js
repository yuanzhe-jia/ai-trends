const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * 使用豆包 LLM 从新闻标题中提取AI相关关键词
 * @param {string[]} titles - 新闻标题数组
 * @returns {Promise<string[]>} - 提取的关键词数组
 */
const extractKeywordsFromTitles = async (titles) => {
  if (!titles || titles.length === 0) {
    logger.warn('没有标题可分析', 'LLM');
    return [];
  }

  if (!config.llm.apiKey) {
    logger.warn('未配置豆包 API Key，跳过 LLM 关键词提取', 'LLM');
    return [];
  }

  try {
    const prompt = `你是一个AI领域的关键词提取专家。请从以下新闻标题中提取与AI（人工智能）密切相关的关键词。

要求：
1. 关键词必须与AI领域高度相关（如：大模型、GPT、ChatGPT、Claude、机器学习、神经网络、OpenAI、Agent等）
2. 每个标题最多提取3个关键词
3. 只返回AI相关的关键词，忽略与AI无关的内容
4. 返回JSON格式的关键词数组，例如：["GPT", "OpenAI", "大模型"]
5. 不要返回重复的关键词
6. 关键词数量控制在10-20个之间

新闻标题：
${titles.map((title, i) => `${i + 1}. ${title}`).join('\n')}`;

    const response = await axios.post(
      config.llm.endpoint,
      {
        model: config.llm.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.llm.apiKey}`,
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0]?.message?.content || '';
    
    // 提取 JSON 数组
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const keywords = JSON.parse(jsonMatch[0]);
      logger.info(`LLM 提取到 ${keywords.length} 个关键词`, 'LLM');
      return keywords;
    }

    logger.warn('LLM 返回格式异常，无法解析关键词', 'LLM');
    return [];
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error('LLM API 请求超时', 'LLM');
    } else if (error.response) {
      logger.error(`LLM API 错误: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`, 'LLM');
    } else {
      logger.error(`LLM API 请求失败: ${error.message}`, 'LLM');
    }
    return [];
  }
};

/**
 * 从文章列表中提取关键词并统计出现次数
 * @param {Object[]} articles - 文章列表
 * @returns {Promise<Object>} - 关键词及其出现次数
 */
const extractKeywordsFromArticles = async (articles) => {
  if (!articles || articles.length === 0) {
    return {};
  }

  const titles = articles.map((a) => a.title).filter(Boolean);
  const keywords = await extractKeywordsFromTitles(titles);

  if (keywords.length === 0) {
    return {};
  }

  // 统计每个关键词出现的文章数
  const keywordCounts = {};
  keywords.forEach((keyword) => {
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

module.exports = {
  extractKeywordsFromTitles,
  extractKeywordsFromArticles,
};
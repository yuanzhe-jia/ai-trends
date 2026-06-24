// 使用相对路径，在生产环境中自动使用当前域名
const API_BASE = '/api';

let selectedKeyword = null;
let isLoading = false;
let currentTrends = [];

// 获取最近有数据的日期：优先昨天，没有则找最近一天
let cachedLatestDate = null;
const getLatestDateWithData = async () => {
  // 如果有缓存的日期（从趋势数据中获取）
  if (cachedLatestDate) {
    return cachedLatestDate;
  }
  
  // 默认返回昨天
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// 检查并触发当日第一次访问的数据更新
const checkAndTriggerDailyUpdate = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // 检查是否需要更新（检查昨天的数据是否存在）
    const response = await fetch(`${API_BASE}/trends/check-update`);
    const data = await response.json();
    
    if (data.needUpdate) {
      // 显示更新提示
      showUpdateNotification();
      
      // 触发数据更新
      await fetch(`${API_BASE}/rss/update`, { method: 'POST' });
      await fetch(`${API_BASE}/trends/update`, { method: 'POST' });
      await fetch(`${API_BASE}/articles/cleanup`, { method: 'POST' });
      
      // 更新完成后刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('检查更新失败:', error);
    return false;
  }
};

// 显示更新提示
const showUpdateNotification = () => {
  const container = document.getElementById('update-notification');
  if (container) {
    container.innerHTML = `
      <div class="fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-pulse">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <span class="font-medium">正在更新数据...</span>
      </div>
    `;
  }
};

const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || '请求失败');
  } catch (error) {
    console.error(`获取数据失败 ${endpoint}:`, error);
    return [];
  }
};

const getSourceColor = (source) => {
  const colors = {
    '量子位': 'bg-blue-500/20 text-blue-300',
    '掘金': 'bg-orange-500/20 text-orange-300',
    '36氪': 'bg-red-500/20 text-red-300',
  };
  return colors[source] || 'bg-gray-500/20 text-gray-300';
};

const getHeatmapStyle = (count, maxCount, index) => {
  const ratio = count / maxCount;
  
  const hueStart = 260;
  const hueEnd = 320;
  const hue = hueStart + ratio * (hueEnd - hueStart);
  
  const saturation = 70;
  const lightness = 35 + ratio * 18;
  
  return {
    backgroundColor: `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%) 0%, hsl(${hue + 10}, ${saturation}%, ${lightness - 5}%) 100%)`,
    color: '#ffffff',
    fontSize: '14px',
    padding: '8px 16px',
    animationDelay: `${index * 40}ms`,
  };
};

const renderHeatmap = (trends) => {
  currentTrends = trends;
  const container = document.getElementById('heatmap-container');
  
  if (!container) {
    console.error('heatmap-container not found');
    return;
  }

  if (!Array.isArray(trends) || trends.length === 0) {
    container.innerHTML = `
      <div class="w-full h-[80px] flex items-center justify-center">
        <span class="text-gray-400">暂无关键词</span>
      </div>
    `;
    return;
  }

  const sortedTrends = [...trends].sort((a, b) => b.total_count - a.total_count);
  const keywordMaxCount = Math.max(...sortedTrends.map(t => t.total_count), 1);
  const maxCount = keywordMaxCount;
  
  const avgCount = sortedTrends.reduce((sum, t) => sum + t.total_count, 0) / sortedTrends.length;
  
  // 只保留热门和探索两个分组
  const hotKeywords = sortedTrends.filter(t => t.total_count >= avgCount);
  const coldKeywords = sortedTrends.filter(t => t.total_count < avgCount);

  const renderKeywordGroup = (keywords, label, delayOffset = 0) => {
    if (keywords.length === 0) return '';
    
    return `
      <div class="w-full" data-group="${label}">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2 h-2 rounded-full ${label === '热门' ? 'bg-pink-500' : 'bg-gray-500'}"></span>
          <span class="text-xs text-gray-400 font-medium">${label}</span>
          <span class="text-xs text-gray-500">(${keywords.length})</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${keywords.map((trend, index) => {
            const style = getHeatmapStyle(trend.total_count, maxCount, delayOffset + index);
            const isActive = selectedKeyword === trend.keyword;
            const activeClass = isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : '';
            
            return `
              <span 
                class="heatmap-cell ${activeClass} font-medium rounded-xl inline-flex items-center gap-1.5"
                data-keyword="${trend.keyword}"
                style="${Object.entries(style).map(([k, v]) => k === 'animationDelay' ? '' : `${k}: ${v}`).join('; ')}"
                onclick="selectKeyword('${trend.keyword}')"
                title="包含此关键词的文章数: ${trend.total_count}"
              >
                <span>${trend.keyword}</span>
                <span class="opacity-80 text-xs font-bold">${trend.total_count}</span>
              </span>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="space-y-4">
      ${renderKeywordGroup(hotKeywords, '热门', 0)}
      ${renderKeywordGroup(coldKeywords, '探索', hotKeywords.length)}
    </div>
  `;

  initHeatmapAnimations();
};

const updateHeatmapSelection = () => {
  const cells = document.querySelectorAll('.heatmap-cell');
  cells.forEach(cell => {
    const keyword = cell.dataset.keyword;
    if (keyword === selectedKeyword) {
      cell.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-slate-800');
    } else {
      cell.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-slate-800');
    }
  });
};

const initHeatmapAnimations = () => {
  const cells = document.querySelectorAll('.heatmap-cell');
  cells.forEach((cell, index) => {
    cell.style.animation = `heatmapAppear 0.5s ease-out ${index * 40}ms both`;
    
    cell.addEventListener('click', () => {
      cell.style.animation = 'heatmapClick 0.3s ease-out';
      setTimeout(() => {
        cell.style.animation = '';
      }, 300);
    });
  });
};

const renderNewsList = (articles) => {
  const container = document.getElementById('news-list');
  const countElement = document.getElementById('news-count');
  
  if (!container || !countElement) {
    console.error('news-list or news-count not found');
    return;
  }

  if (!Array.isArray(articles) || articles.length === 0) {
    const message = selectedKeyword 
      ? `没有找到包含 "${selectedKeyword}" 的新闻` 
      : '暂无新闻数据';
    container.innerHTML = `
      <div class="space-y-2 h-full">
        <div class="h-[280px] flex items-center justify-center">
          <span class="text-gray-400">${message}</span>
        </div>
      </div>
    `;
    countElement.textContent = '';
    return;
  }

  countElement.textContent = `(${articles.length}篇)`;
  
  container.innerHTML = `
    <div class="space-y-2 h-full">
      ${articles.map((article, index) => {
        const date = article.published_at 
          ? new Date(article.published_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
          : article.fetched_at 
            ? new Date(article.fetched_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
            : '未知';
        
        const sourceColor = getSourceColor(article.source);
        
        return `
          <div class="news-item fade-in p-3 bg-white/5 rounded-lg hover:bg-white/10" style="animation-delay: ${index * 50}ms">
            <a href="${article.url}" target="_blank" class="block group">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h3 class="text-white text-sm font-medium line-clamp-2 mb-1 group-hover:text-purple-300 transition-colors">${article.title}</h3>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="source-badge ${sourceColor}">${article.source}</span>
                    <span class="text-gray-500 text-xs">${date}</span>
                  </div>
                </div>
                <svg class="w-4 h-4 text-gray-500 flex-shrink-0 mt-1 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </div>
            </a>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

let trendChart = null;

const renderTrendHistory = (keyword, history) => {
  const container = document.getElementById('trend-history');
  
  if (!container) {
    console.error('trend-history not found');
    return;
  }

  if (!keyword || !Array.isArray(history) || history.length === 0) {
    container.innerHTML = `
      <div class="h-[280px] flex flex-col">
        <div class="mb-4"></div>
        <div class="flex-1 flex items-center justify-center">
          <span class="text-gray-400 text-sm">选择关键词查看趋势历史</span>
        </div>
      </div>
    `;
    
    if (trendChart) {
      trendChart.destroy();
      trendChart = null;
    }
    return;
  }

  // 生成最近30天的完整日期范围（基于最新数据日期，而不是今天）
  const latestDateInHistory = history.length > 0 
    ? new Date(history[history.length - 1].date)  // 最后一个是最新的
    : new Date();
  
  const thirtyDaysAgo = new Date(latestDateInHistory);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  
  const dateRange = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    dateRange.push(d.toISOString().split('T')[0]);
  }
  
  // 将历史数据转换为日期映射
  const historyMap = new Map();
  history.forEach(h => {
    historyMap.set(h.date, h.count);
  });
  
  // 生成完整的标签和数据
  const labels = dateRange.map(d => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const data = dateRange.map(d => historyMap.get(d) || 0);
  // 使用所有关键词历史数据中的最大值作为Y轴上限（确保所有趋势图刻度一致）
  const globalMaxValue = globalMaxHeat;
  
  container.innerHTML = `
    <div class="mb-4">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
        <h3 class="text-white font-medium text-lg">${keyword}</h3>
      </div>
      <p class="text-gray-400 text-xs mt-1">近30天趋势</p>
    </div>
    <div class="relative" style="height: 220px;">
        <canvas id="trendChart"></canvas>
      </div>
  `;

  const ctx = document.getElementById('trendChart').getContext('2d');
  
  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: keyword,
        data: data,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#f1f5f9',
          borderColor: 'rgba(168, 85, 247, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              return `热度: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 10
            },
            maxRotation: 45,
            minRotation: 45,
          }
        },
        y: {
          beginAtZero: true,
          max: globalMaxValue,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 11
            },
            stepSize: 1,
          }
        }
      }
    }
  });
};

const selectKeyword = async (keyword) => {
  if (isLoading) return;
  
  isLoading = true;
  updateLoadingState(true);
  
  try {
    selectedKeyword = selectedKeyword === keyword ? null : keyword;
    
    // 获取日期
    let dateToUse = cachedLatestDate;
    if (!dateToUse && currentTrends.length > 0) {
      dateToUse = currentTrends[0].date;
    }
    if (!dateToUse) {
      dateToUse = await getLatestDateWithData();
    }
    
    let articles, history;
    
    if (selectedKeyword) {
      // 选择了关键词：只返回标题中包含该关键词的文章
      [articles, history] = await Promise.all([
        fetchData(`/articles?keyword=${encodeURIComponent(selectedKeyword)}&date=${dateToUse}`),
        fetchData(`/trends/${encodeURIComponent(selectedKeyword)}/history?days=30`)
      ]);
    } else {
      // 未选择关键词：返回标题中包含任意关键词的文章（不限制数量）
      const allArticles = await fetchData(`/articles?date=${dateToUse}`);
      const keywords = currentTrends.map(t => t.keyword);
      articles = allArticles.filter(article => {
        return keywords.some(keyword => {
          const pattern = new RegExp(keyword, 'i');
          return pattern.test(article.title);
        });
      });
      history = [];
    }
    
    updateHeatmapSelection();
    renderNewsList(articles);
    renderTrendHistory(selectedKeyword, history);
    
    updateSelectedKeywordDisplay();
    updateClearButton();
  } catch (error) {
    console.error('选择关键词失败:', error);
  } finally {
    isLoading = false;
    updateLoadingState(false);
  }
};

const updateLoadingState = (loading) => {
  const container = document.getElementById('heatmap-container');
  if (container) {
    container.style.opacity = loading ? '0.5' : '1';
    container.style.pointerEvents = loading ? 'none' : 'auto';
  }
};

const updateSelectedKeywordDisplay = () => {
  const container = document.getElementById('selected-keyword');
  if (!container) return;
  
  if (selectedKeyword) {
    container.innerHTML = `
      <div class="flex items-center justify-center gap-3">
        <span class="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white px-5 py-2.5 rounded-full border border-purple-500/30">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
          </svg>
          <span class="font-medium">当前筛选：${selectedKeyword}</span>
        </span>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-gray-500 text-sm">点击关键词查看相关新闻和趋势</span>
      </div>
    `;
  }
};

const updateClearButton = () => {
  const button = document.getElementById('clear-filter');
  if (button) {
    button.style.display = selectedKeyword ? 'block' : 'none';
  }
};

const clearFilter = () => {
  selectKeyword(null);
};

const init = async () => {
  try {
    // 检查是否需要更新数据（当日第一次访问时）
    await checkAndTriggerDailyUpdate();
    
    // 先获取趋势数据，从中提取日期
    const trends = await fetchData('/trends?days=7');
    
    // 从趋势数据中获取日期（取第一个趋势的日期）
    let dateToUse;
    if (trends.length > 0) {
      dateToUse = trends[0].date;
      cachedLatestDate = dateToUse;
    } else {
      dateToUse = await getLatestDateWithData();
    }
    
    // 获取所有关键词历史数据中的最大值，用于统一所有趋势图的Y轴
    const maxHeatData = await fetchData('/trends/max-heat-history');
    globalMaxHeat = maxHeatData || 1;
    
    // 更新页面上的日期显示
    const updateDateEl = document.getElementById('update-date');
    if (updateDateEl && dateToUse) {
      const date = new Date(dateToUse);
      updateDateEl.textContent = `${date.getMonth() + 1}月${date.getDate()}日`;
    }
    
    // 用这个日期去获取文章（不限制数量，确保获取所有相关文章）
    const articles = await fetchData(`/articles?date=${dateToUse}`);
    
    // 过滤文章：只保留标题中包含任意关键词的文章
    const keywords = trends.map(t => t.keyword);
    const filteredArticles = articles.filter(article => {
      return keywords.some(keyword => {
        const pattern = new RegExp(keyword, 'i');
        return pattern.test(article.title);
      });
    });

    renderHeatmap(trends);
    renderNewsList(filteredArticles);
    renderTrendHistory(null, []);
    updateSelectedKeywordDisplay();
    updateClearButton();
  } catch (error) {
    console.error('初始化失败:', error);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const clearBtn = document.getElementById('clear-filter');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearFilter);
  }
  init();
});

window.selectKeyword = selectKeyword;

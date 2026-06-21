#!/bin/bash

set -e

echo "=== 开始部署 AI-Trends ==="

echo "1. 拉取最新代码..."
cd /root/ai-trends
git pull origin main

echo "2. 安装依赖..."
npm install --production

echo "3. 重启服务..."
pm2 reload ecosystem.config.js

echo "4. 验证服务状态..."
pm2 status

echo "=== 部署完成 ==="
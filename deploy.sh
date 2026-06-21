#!/bin/bash

set -e

echo "=== 开始部署 AI-Trends ==="

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "当前工作目录: $(pwd)"

echo "1. 拉取最新代码..."
git pull origin main

echo "2. 安装依赖..."
npm install --production

echo "3. 重启服务..."
pm2 reload ecosystem.config.js

echo "4. 验证服务状态..."
pm2 status

echo "=== 部署完成 ==="
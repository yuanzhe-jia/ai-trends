#!/bin/bash

set -e

echo "=== 开始部署 AI-Trends ==="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "当前工作目录: $(pwd)"

echo "1. 拉取最新代码..."
git pull origin main

echo "2. 安装依赖..."
npm install --production

echo "3. 确保数据和日志目录存在..."
mkdir -p data logs

echo "4. 确保 cron 定时任务已配置..."
chmod +x scripts/setup-cron.sh
./scripts/setup-cron.sh "0 3 * * *" > /dev/null 2>&1

echo "5. 重启服务..."
pm2 reload ecosystem.config.js

echo "6. 验证服务状态..."
pm2 status

echo "7. 等待服务启动..."
sleep 3

echo "8. 健康检查..."
if curl -s http://localhost:3000/api/health > /dev/null; then
  echo "服务健康检查通过"
else
  echo "服务健康检查失败"
  pm2 logs ai-trends --lines 50
  exit 1
fi

echo "=== 部署完成 ==="
echo ""
echo "常用命令:"
echo "  查看 cron 日志: tail -f logs/cron.log"
echo "  手动更新数据: npm run update"
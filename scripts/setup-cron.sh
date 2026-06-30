#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

CRON_SCHEDULE="${1:-0 3 * * *}"
CRON_LOG_DIR="$SCRIPT_DIR/logs"
CRON_LOG_FILE="$CRON_LOG_DIR/cron.log"
NODE_PATH=$(which node)
NPM_PATH=$(which npm)

echo "=== 配置 AI-Trends Cron 定时任务 ==="
echo "项目目录: $SCRIPT_DIR"
echo "Node 路径: $NODE_PATH"
echo "npm 路径: $NPM_PATH"
echo "Cron 表达式: $CRON_SCHEDULE"
echo "Cron 日志: $CRON_LOG_FILE"

mkdir -p "$CRON_LOG_DIR"

CRON_CMD="cd $SCRIPT_DIR && $NPM_PATH run update >> $CRON_LOG_FILE 2>&1"
CRON_ENTRY="$CRON_SCHEDULE $CRON_CMD"

EXISTING_CRON=$(crontab -l 2>/dev/null || true)

if echo "$EXISTING_CRON" | grep -q "ai-trends.*cron.log"; then
  echo "检测到已有的 ai-trends cron 任务，正在更新..."
  NEW_CRON=$(echo "$EXISTING_CRON" | grep -v "ai-trends.*cron.log")
  echo "$NEW_CRON" > /tmp/crontab_tmp
  echo "# ai-trends daily update" >> /tmp/crontab_tmp
  echo "$CRON_ENTRY" >> /tmp/crontab_tmp
else
  echo "添加新的 ai-trends cron 任务..."
  echo "$EXISTING_CRON" > /tmp/crontab_tmp
  echo "" >> /tmp/crontab_tmp
  echo "# ai-trends daily update" >> /tmp/crontab_tmp
  echo "$CRON_ENTRY" >> /tmp/crontab_tmp
fi

crontab /tmp/crontab_tmp
rm /tmp/crontab_tmp

echo ""
echo "=== Cron 配置完成 ==="
echo "当前 crontab:"
crontab -l
echo ""
echo "手动测试更新命令:"
echo "  cd $SCRIPT_DIR && npm run update"
echo ""
echo "查看 cron 日志:"
echo "  tail -f $CRON_LOG_FILE"

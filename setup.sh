#!/bin/bash

set -e

echo "=== AI-Trends 服务器初始化 ==="

echo "1. 更新系统..."
sudo apt-get update && sudo apt-get upgrade -y

echo "2. 设置时区..."
sudo timedatectl set-timezone Asia/Shanghai

echo "3. 安装 Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs

echo "4. 安装 PM2..."

# 验证 PM2 安装路径
PM2_PATH=$(which pm2)
echo "PM2 安装路径: $PM2_PATH"

echo "5. 创建数据目录..."
mkdir -p data logs

echo "6. 安装项目依赖..."
npm install --production

echo "7. 配置 systemd..."
# 获取当前目录
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 创建 systemd 服务文件（使用实际路径）
sudo tee /etc/systemd/system/ai-trends.service > /dev/null <<EOL
[Unit]
Description=AI Trends Service
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=$CURRENT_DIR
ExecStart=$PM2_PATH start ecosystem.config.js --daemon
ExecReload=$PM2_PATH reload ecosystem.config.js
ExecStop=$PM2_PATH delete ai-trends
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=TZ=Asia/Shanghai

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl daemon-reload
sudo systemctl enable ai-trends.service

echo "8. 启动服务..."
sudo systemctl start ai-trends.service

echo "9. 配置系统 Cron 定时任务（每日凌晨3:00自动更新）..."
mkdir -p logs
CRON_LOG_FILE="$(pwd)/logs/cron.log"
CRON_CMD="cd $(pwd) && $(which npm) run update >> $CRON_LOG_FILE 2>&1"
CRON_ENTRY="0 3 * * * $CRON_CMD"
EXISTING_CRON=$(crontab -l 2>/dev/null || true)
if echo "$EXISTING_CRON" | grep -q "ai-trends.*cron.log"; then
  NEW_CRON=$(echo "$EXISTING_CRON" | grep -v "ai-trends.*cron.log")
  echo "$NEW_CRON" > /tmp/crontab_tmp
  echo "# ai-trends daily update" >> /tmp/crontab_tmp
  echo "$CRON_ENTRY" >> /tmp/crontab_tmp
else
  echo "$EXISTING_CRON" > /tmp/crontab_tmp
  echo "" >> /tmp/crontab_tmp
  echo "# ai-trends daily update" >> /tmp/crontab_tmp
  echo "$CRON_ENTRY" >> /tmp/crontab_tmp
fi
crontab /tmp/crontab_tmp
rm /tmp/crontab_tmp
echo "Cron 定时任务已配置"

echo "=== 初始化完成 ==="
echo ""
echo "服务状态:"
systemctl status ai-trends.service --no-pager
echo ""
echo "访问地址: http://111.231.106.182:3000"
echo "服务用户: ubuntu"
echo "端口: 3000"
echo ""
echo "定时任务: 系统 cron 每日凌晨 3:00 自动更新数据"
echo "查看 cron 日志: tail -f logs/cron.log"
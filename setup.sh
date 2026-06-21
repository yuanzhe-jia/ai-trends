#!/bin/bash

set -e

echo "=== AI-Trends 服务器初始化 ==="

echo "1. 更新系统..."
sudo apt-get update && sudo apt-get upgrade -y

echo "2. 安装 Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs

echo "3. 安装 PM2..."
sudo npm install pm2 -g

# 验证 PM2 安装路径
PM2_PATH=$(which pm2)
echo "PM2 安装路径: $PM2_PATH"

echo "4. 创建数据目录..."
mkdir -p data logs

echo "5. 安装项目依赖..."
npm install --production

echo "6. 配置 systemd..."
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

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl daemon-reload
sudo systemctl enable ai-trends.service

echo "7. 启动服务..."
sudo systemctl start ai-trends.service

echo "=== 初始化完成 ==="
echo ""
echo "服务状态:"
systemctl status ai-trends.service --no-pager
echo ""
echo "访问地址: http://111.231.106.182:3000"
echo "服务用户: ubuntu"
echo "端口: 3000"
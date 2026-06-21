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

echo "4. 创建数据目录..."
mkdir -p data logs

echo "5. 安装项目依赖..."
npm install --production

echo "6. 配置 systemd..."
cp ai-trends.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable ai-trends.service

echo "7. 启动服务..."
systemctl start ai-trends.service

echo "=== 初始化完成 ==="
echo ""
echo "服务状态:"
systemctl status ai-trends.service
echo ""
echo "访问地址: http://111.231.106.182:3000"
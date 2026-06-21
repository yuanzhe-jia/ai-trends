module.exports = {
  apps: [{
    name: 'ai-trends',
    script: 'src/backend/server.js',
    cwd: '/root/ai-trends',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/root/ai-trends/logs/pm2-error.log',
    out_file: '/root/ai-trends/logs/pm2-out.log',
    merge_logs: true,
  }],
};
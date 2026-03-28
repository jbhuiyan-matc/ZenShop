module.exports = {
  apps: [{
    name: 'zenshop-backend',
    script: 'src/index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production'
    },
    // Restart strategy: exponential backoff
    exp_backoff_restart_delay: 1000,
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    // Logging
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};

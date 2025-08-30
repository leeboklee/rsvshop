module.exports = {
  apps: [
    {
      name: 'RSVShop',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/rsvshop/projects/rsvshop',
      env: {
        NODE_ENV: 'wsl',
        HOSTNAME: '0.0.0.0',
        NODE_OPTIONS: '--max-old-space-size=2048 --max-semi-space-size=128'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};

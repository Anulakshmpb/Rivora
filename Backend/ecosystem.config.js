module.exports = {
  apps: [
    {
      name: 'ecommerce-api',
      script: 'server.js',
      instances: 'max', // Utilizes all available CPU cores on the EC2 instance
      exec_mode: 'cluster', // Enables clustering mode
      autorestart: true, // Automatically restarts if app crashes
      watch: false, // Prevents reloading in production due to static uploads or logs
      max_memory_restart: '1G', // Restarts the app if it exceeds 1GB memory limit (prevents memory leaks)
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true, // Merges logs from all cluster instances into one file
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
        // Sensitive environment variables (MONGODB_URI, AWS keys, JWT secrets)
        // should be stored in the Ubuntu server's .env file and loaded via dotenv.
      }
    }
  ]
};

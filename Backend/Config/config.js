require('dotenv').config();

module.exports = {
   PORT: process.env.PORT || 5000,
   MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rivora",
   NODE_ENV: process.env.NODE_ENV || 'development',

   JWT: {
      USER_SECRET: process.env.JWT_USER_SECRET || "user_jwt",
      ADMIN_SECRET: process.env.JWT_ADMIN_SECRET || "admin_jwt",
      EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
      REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d'

   },

   BCRYPT_ROUNDS: 12,

   ADMIN: {
      EMAIL: process.env.ADMIN_EMAIL || 'admin@gmail.com',
      PASSWORD: process.env.ADMIN_PASSWORD || 'admin@123',
      NAME: 'Administrator'

   },
   CORS: {
      ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
      CREDENTIALS: true,
      METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With']
   },

   EMAIL: {
      SERVICE: process.env.EMAIL_SERVICE,
      USER: process.env.EMAIL_USER,
      PASS: process.env.EMAIL_PASS
   },

   RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000,
      MAX_REQUESTS: 1000,
      AUTH_MAX_REQUESTS: 100
   },
   
   SOCKET: {
      CORS_ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
      METHODS: ['GET', 'POST'],
      CREDENTIALS: true
    },
    
    PAGINATION: {
      DEFAULT_LIMIT: 10,
      MAX_LIMIT: 100
    },
    
    LOGGING: {
      LEVEL: process.env.LOG_LEVEL || 'info',
      MAX_FILES: 5,
      MAX_SIZE: '20m'
    }

}
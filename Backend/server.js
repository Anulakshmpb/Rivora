const express = require('express');
const http = require('http');
const config = require('./Config/config');
const DBConnect = require('./Config/db');
const { setupMiddleware } = require('./Middlewares/setup');
const { setupRoutes } = require('./Routes/index');
const { errorHandler, notFound } = require('./Middlewares/errorHandler');
const logger = require('./utils/logger');

class Server {
    constructor() {
        this.app = express();
        this.port = config.PORT;
        this.server = null;
    }

    async initialize() {
        try {
            // 1. Connect to Database
            await DBConnect.connect();
            logger.info('Connected to Database successfully');

            // 2. Setup Global Middlewares
            setupMiddleware(this.app);

            // 3. Setup Routes
            setupRoutes(this.app);

            // 4. Handle 404 (Not Found)
            this.app.use(notFound);

            // 5. Global Error Handler
            this.app.use(errorHandler);

            // 6. Start listening
            this.server = http.createServer(this.app);
            this.server.listen(this.port, () => {
                logger.info(`Server running in ${config.NODE_ENV} mode on port ${this.port}`);
            });

            // Handle unhandled rejections
            process.on('unhandledRejection', (err) => {
                logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
                    error: err.message,
                    stack: err.stack
                });
                this.gracefulShutdown();
            });

            // Handle uncaught exceptions
            process.on('uncaughtException', (err) => {
                logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
                    error: err.message,
                    stack: err.stack
                });
                process.exit(1);
            });

            // Graceful shutdown listeners
            process.on('SIGTERM', () => this.gracefulShutdown());
            process.on('SIGINT', () => this.gracefulShutdown());

        } catch (error) {
            logger.error('Initialization failed:', { error: error.message });
            process.exit(1);
        }
    }

    async gracefulShutdown() {
        logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');
        
        if (this.server) {
            this.server.close(() => {
                logger.info('Process terminated. Closed remaining connections.');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }

        // Force close after 10s if not closed
        setTimeout(() => {
            logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    }
}

// Global handlers for immediate errors before server initialization
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥', err.message, err.stack);
    process.exit(1);
});

const server = new Server();
server.initialize();
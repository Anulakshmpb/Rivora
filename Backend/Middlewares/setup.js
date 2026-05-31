const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const config = require('../Config/config');

const requestLogger = require('./requestLogger');

const setupMiddleware = (app)=>{

    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
        .split(',')
        .map(origin => origin.trim());

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: config.CORS.METHODS,
        allowedHeaders: config.CORS.ALLOWED_HEADERS
    }));

    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false
    }));

    app.use(rateLimit({

        windowMs:config.RATE_LIMIT.WINDOW_MS,

        max:config.RATE_LIMIT.MAX_REQUESTS,

        standardHeaders:true,

        legacyHeaders:false

    }));

    app.use(cookieParser());

    app.use(express.json({

        limit:"50mb"

    }));

    app.use(express.urlencoded({

        extended:true

    }));

    app.use(requestLogger);

    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    app.get("/health",(req,res)=>{


        res.json({

            status:"OK",

            uptime:process.uptime(),

            timestamp:new Date()

        });

    });

};

const createAuthLimiter = ()=>{

    return rateLimit({

        windowMs:15*60*1000,

        max:5,

        message:"Too many login attempts"

    });

};

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, // Limit each IP to 10 login requests per 15 minutes
    message: {
        success: false,
        error: {
            message: "Too many login attempts from this IP, please try again after 15 minutes",
            code: "RATE_LIMIT_EXCEEDED",
            statusCode: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports={
    setupMiddleware,
    createAuthLimiter,
    loginLimiter
};
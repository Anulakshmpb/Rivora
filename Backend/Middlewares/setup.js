const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const config = require('../Config/config');

const requestLogger = require('./requestLogger');

const setupMiddleware = (app)=>{

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

    app.use(cors({
        origin:config.CORS.ORIGIN,
        credentials:true,
        methods:config.CORS.METHODS,
        allowedHeaders:config.CORS.ALLOWED_HEADERS
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

module.exports={
    setupMiddleware,
    createAuthLimiter
};
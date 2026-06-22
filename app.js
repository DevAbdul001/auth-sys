require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path'); 
const { AppError } = require('./errors/error');

const app = express();


app.use(
    helmet()
);

const allowedOrigins = process.env.CORS_ORIGINS;

const corsOptions = { 
    origin : function (origin, callback) {
        if(!origin || origin === allowedOrigins) {
            callback(null, true);
        } else {
            callback(new Error ('Not allowed by Cors'))
        }
    },
    credentials: true, 
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));


app.use(express.static(path.join(__dirname, 'static')));

const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many requests from this IP, please try again later"
    },
    handler: (req, res, next, options) => {
        console.warn("RATE LIMIT HIT", {
            ip: req.ip,
            path: req.originalUrl,
            time: new Date().toISOString(),
            userAgent: req.headers['user-agent']
        });
        return res.status(429).json(options.message);
    }
});

const authRoutes = require('./routes/auth');

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'Server is running'});
});

// Global Error Handler
app.use((err, req, res, next) => {
    if(err instanceof AppError){
        return res.status(err.statusCode).json({ message: err.message});
    }
    console.error(err);
    res.status(500).json({
        message: 'Internal server error'
    });
});

module.exports = app;
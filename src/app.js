import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth.js';
import {
    handleLogin,
    handleRegistration,
    logout,
    getMe,
} from './controllers/auth.controller.js';
import { requireAuth } from './middleware/auth.middleware.js';
import sportsRoutes from './routes/sports.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Allowed frontend origins (comma-separated). The client normally reaches this
// API same-origin via its reverse proxy, but we still allow direct browser
// calls from these origins for flexibility.
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            // Allow same-origin/non-browser requests (no Origin header).
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    }),
);

app.use(cookieParser());

// Health check
app.get('/', (req, res) =>
    res.json({ success: true, message: 'SportNest API is running.' }),
);

/*
 * Custom email/password auth routes. express.json() is applied per-route so it
 * never consumes the raw body that Better Auth's OAuth handler needs below.
 */
app.post('/api/auth/register', express.json(), handleRegistration);
app.post('/api/auth/login', express.json(), handleLogin);
app.post('/api/auth/logout', logout);
app.get('/api/auth/me', requireAuth, getMe);

// Better Auth owns every other /api/auth/* route (Google OAuth + sessions).
app.all('/api/auth/*splat', toNodeHandler(auth));

// From here on, parse JSON globally for the rest of the API.
app.use(express.json());

// Facility + booking CRUD
app.use('/api/v1/sports', sportsRoutes);

// Central error handler
app.use(errorHandler);

export default app;

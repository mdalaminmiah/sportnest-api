import jwt from 'jsonwebtoken';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth.js';
import { User } from '../models/user.model.js';
import { sendResponse } from '../utils/apiResponse.js';

const isMeRoute = (req) =>
    req.originalUrl === '/api/auth/me' || req.path === '/me';

export const requireAuth = async (req, res, next) => {
    try {
        // 1) Primary path: our own HTTPOnly JWT cookie (email/password logins).
        let token = req.cookies?.token;
        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET || 'sportnest_dev_secret',
                );
                const user = await User.findById(decoded.id);
                if (user) {
                    req.user = user;
                    return next();
                }
            } catch {
                // Fall through to the Better Auth session check below.
            }
        }

        // 2) Fallback path: a Better Auth session (Google OAuth users).
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (session?.user) {
            const email = session.user.email?.toLowerCase();
            // Keep a Mongoose mirror so bookings/facilities reference a real user.
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    name: session.user.name || 'SportNest Member',
                    email,
                    image: session.user.image || '',
                    role: 'player',
                });
            }
            req.user = user;
            return next();
        }

        // 3) No credentials at all.
        if (isMeRoute(req)) {
            // Keep the browser console clean on first-load session checks.
            return sendResponse(res, 200, false, 'No active session.', null);
        }
        return sendResponse(
            res,
            401,
            false,
            'Access denied. Please sign in to continue.',
        );
    } catch (error) {
        console.error('Auth verification failure:', error.message);
        if (isMeRoute(req)) {
            return sendResponse(res, 200, false, 'Session expired.', null);
        }
        return sendResponse(
            res,
            401,
            false,
            'Unauthorized. Your session has expired.',
        );
    }
};

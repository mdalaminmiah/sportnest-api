import { betterAuth } from 'better-auth';
import mongoose from 'mongoose';
import { mongodbAdapter } from '@better-auth/mongo-adapter';

// Comma-separated list of allowed frontend origins.
const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

/*
 * Better Auth is used exclusively for Google OAuth — email/password is handled
 * by our own JWT controllers.
 *
 * The frontend reverse-proxies /api/* to this backend, so Better Auth's public
 * URL is the CLIENT origin. That makes the Google redirect_uri
 * (<client>/api/auth/callback/google) resolve back through the proxy, keeping
 * the OAuth state + session cookies first-party. Set BETTER_AUTH_URL to your
 * deployed client origin in production.
 */
export const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || CLIENT_URLS[0],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    trustedOrigins: CLIENT_URLS,
    advanced: {
        // Cookies flow first-party through the proxy. secure + sameSite:lax is
        // enough for the top-level OAuth redirect; partitioned keeps things
        // working even under strict third-party-cookie blocking.
        defaultCookieAttributes: {
            secure: true,
            sameSite: 'lax',
            partitioned: true,
        },
    },
});

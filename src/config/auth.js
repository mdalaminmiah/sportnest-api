import { betterAuth } from 'better-auth';
import mongoose from 'mongoose';
import { mongodbAdapter } from '@better-auth/mongo-adapter';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Better Auth is used exclusively for Google OAuth. Email/password auth is
// handled by our own JWT controllers so we keep full control over the cookie.
export const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    trustedOrigins: [CLIENT_URL],
    advanced: {
        // The OAuth `state`/PKCE cookies must survive a cross-site redirect
        // (frontend → backend → Google → backend). Without these attributes the
        // callback can't read the state cookie and Better Auth throws
        // `state_mismatch`. `partitioned` (CHIPS) keeps them working under
        // modern third-party-cookie blocking.
        defaultCookieAttributes: {
            secure: true,
            sameSite: 'none',
            partitioned: true,
        },
    },
});

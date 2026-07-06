import mongoose from 'mongoose';

/*
 * Serverless-safe MongoDB connection.
 *
 * On Vercel every request may hit a cold or warm Lambda. We cache the
 * connection promise on the global object so a warm invocation reuses the
 * existing connection instead of opening a new one on every request (which
 * would quickly exhaust the Mongo connection pool).
 */
let cached = global._mongooseConn;
if (!cached) {
    cached = global._mongooseConn = { conn: null, promise: null };
}

export const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const DB_URL = process.env.DATABASE_URL;
        if (!DB_URL) {
            throw new Error('DATABASE_URL is not defined.');
        }

        cached.promise = mongoose
            .connect(DB_URL, {
                // Fail fast in serverless instead of buffering queries forever.
                bufferCommands: false,
            })
            .then((mongooseInstance) => mongooseInstance);
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

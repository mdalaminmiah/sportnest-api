import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

/*
 * Vercel serverless entry point.
 *
 * Vercel does not run `app.listen()` — it invokes this handler per request.
 * We ensure the (cached) database connection is ready, then delegate to the
 * Express app, which is itself a valid (req, res) handler.
 */
export default async function handler(req, res) {
    try {
        await connectDB();
    } catch (err) {
        console.error('❌ Database connection failure:', err.message);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(
            JSON.stringify({
                success: false,
                message: 'Database connection failed.',
            }),
        );
        return;
    }

    return app(req, res);
}

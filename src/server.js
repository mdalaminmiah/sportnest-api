import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
    console.error('🚨 CRITICAL CONFIG ERROR: DATABASE_URL is not defined.');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log('✅ MongoDB Connected Successfully');

        const server = app.listen(PORT, () => {
            console.log(
                `🚀 SportNest API operational on: http://localhost:${PORT}`,
            );
        });

        const shutdown = async () => {
            console.log('\n🛑 Closing server and database connection...');
            await mongoose.connection.close();
            server.close(() => process.exit(0));
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    } catch (err) {
        console.error('❌ Critical database connectivity failure:', err.message);
        process.exit(1);
    }
};

connectDB();

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    process.exit(1);
});

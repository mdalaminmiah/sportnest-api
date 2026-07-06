import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        // Optional: social (Google) accounts are provisioned without a local password
        password: { type: String, select: false },
        image: { type: String, default: '' },
        role: { type: String, default: 'player' },
    },
    { timestamps: true },
);

// Better Auth persists social accounts in the shared "user" collection, so we
// reuse the exact same collection name to keep a single source of truth.
export const User = mongoose.model('User', userSchema, 'user');

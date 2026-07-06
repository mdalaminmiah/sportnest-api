import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { sendResponse } from '../utils/apiResponse.js';

const TOKEN_COOKIE = 'token';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const signToken = (user) =>
    jwt.sign(
        { id: user._id, email: user.email, role: user.role || 'player' },
        process.env.JWT_SECRET || 'sportnest_dev_secret',
        { expiresIn: '7d' },
    );

const cookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: SEVEN_DAYS,
        path: '/',
    };
};

// POST /api/auth/register
export const handleRegistration = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const image = req.body.image?.trim() || '';
        const { password } = req.body;

        if (!name || !email || !password) {
            return sendResponse(
                res,
                400,
                false,
                'Please fill in all registration fields completely.',
            );
        }

        // Enforce the assignment password policy on the server too.
        if (
            password.length < 6 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password)
        ) {
            return sendResponse(
                res,
                400,
                false,
                'Password needs at least 6 characters with one uppercase and one lowercase letter.',
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(
                res,
                409,
                false,
                'This email address is already registered.',
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            image,
            password: hashedPassword,
            role: 'player',
        });

        return sendResponse(
            res,
            201,
            true,
            'Profile registered successfully! You can now sign in.',
            {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    image: newUser.image,
                },
            },
        );
    } catch (error) {
        console.error('Registration error:', error.message);
        return sendResponse(
            res,
            500,
            false,
            'Internal error while creating your account.',
        );
    }
};

// POST /api/auth/login
export const handleLogin = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            return sendResponse(
                res,
                400,
                false,
                'Please enter your email and password.',
            );
        }

        // password is select:false, so request it explicitly.
        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password) {
            return sendResponse(
                res,
                401,
                false,
                'Invalid email or password. Please try again.',
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return sendResponse(
                res,
                401,
                false,
                'Invalid email or password. Please try again.',
            );
        }

        res.cookie(TOKEN_COOKIE, signToken(user), cookieOptions());

        return sendResponse(res, 200, true, 'Welcome back to SportNest!', {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role || 'player',
            },
        });
    } catch (error) {
        console.error('Login error:', error.message);
        return sendResponse(
            res,
            500,
            false,
            'Internal authentication error. Please try again.',
        );
    }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie(TOKEN_COOKIE, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
        });
        return sendResponse(res, 200, true, 'Logged out successfully.');
    } catch (error) {
        console.error('Logout error:', error.message);
        return sendResponse(res, 500, false, 'Internal error during logout.');
    }
};

// GET /api/auth/me  (protected by requireAuth)
export const getMe = async (req, res) => {
    try {
        return sendResponse(res, 200, true, 'User profile fetched.', {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                image: req.user.image || '',
                role: req.user.role || 'player',
            },
        });
    } catch (error) {
        return sendResponse(res, 500, false, 'Failed to fetch user profile.');
    }
};

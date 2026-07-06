import { sendResponse } from '../utils/apiResponse.js';

// Central error handler. Maps common Mongoose errors to the right status codes
// so clients get 400/404/409 instead of a generic 500.
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Invalid ObjectId (e.g. /facility/not-a-real-id)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Schema validation failed (missing/invalid fields)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(' ');
    }

    // Duplicate unique key (e.g. email already exists)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `A record with this ${field} already exists.`;
    }

    if (statusCode >= 500) {
        console.error('💥 Server error:', err.stack || err.message || err);
    }

    return sendResponse(res, statusCode, false, message);
};

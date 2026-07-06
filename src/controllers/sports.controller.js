import * as sportsService from '../services/sports.service.js';
import { sendResponse } from '../utils/apiResponse.js';

// GET /all — public list with optional ?search= and ?type=
export const getAvailableCourts = async (req, res, next) => {
    try {
        const { search, type } = req.query;
        const data = await sportsService.queryCourts(search, type);
        return sendResponse(res, 200, true, 'Facilities fetched.', data);
    } catch (err) {
        next(err);
    }
};

// GET /facility/:id — public details
export const getCourtDetails = async (req, res, next) => {
    try {
        const data = await sportsService.getSingleCourt(req.params.id);
        if (!data) {
            return sendResponse(res, 404, false, 'Facility not found.');
        }
        return sendResponse(res, 200, true, 'Facility details fetched.', data);
    } catch (err) {
        next(err);
    }
};

// GET /my-facilities — private, owner's facilities
export const getMyFacilities = async (req, res, next) => {
    try {
        const data = await sportsService.getCourtsByOwner(req.user.email);
        return sendResponse(res, 200, true, 'Your facilities fetched.', data);
    } catch (err) {
        next(err);
    }
};

// POST /create — private, owner_email auto-filled from the session
export const createNewCourt = async (req, res, next) => {
    try {
        const data = await sportsService.createCourtInstance({
            ...req.body,
            owner_email: req.user.email,
        });
        return sendResponse(res, 201, true, 'Facility created.', data);
    } catch (err) {
        next(err);
    }
};

// PUT /update/:id — private, owner only
export const updateCourt = async (req, res, next) => {
    try {
        // Never allow the owner_email to be reassigned via an update.
        const { owner_email, ...updates } = req.body;
        const data = await sportsService.modifyCourtData(
            req.params.id,
            req.user.email,
            updates,
        );
        if (!data) {
            return sendResponse(
                res,
                403,
                false,
                'Facility not found or you are not the owner.',
            );
        }
        return sendResponse(res, 200, true, 'Facility updated.', data);
    } catch (err) {
        next(err);
    }
};

// DELETE /delete/:id — private, owner only
export const deleteCourt = async (req, res, next) => {
    try {
        const data = await sportsService.removeCourtInstance(
            req.params.id,
            req.user.email,
        );
        if (!data) {
            return sendResponse(
                res,
                403,
                false,
                'Facility not found or you are not the owner.',
            );
        }
        return sendResponse(res, 200, true, 'Facility deleted.');
    } catch (err) {
        next(err);
    }
};

// POST /book — private, user_email from the session
export const createBooking = async (req, res, next) => {
    try {
        const data = await sportsService.processNewBooking({
            ...req.body,
            user_email: req.user.email,
        });
        return sendResponse(res, 201, true, 'Booking created.', data);
    } catch (err) {
        next(err);
    }
};

// GET /my-bookings — private
export const getMyBookings = async (req, res, next) => {
    try {
        const data = await sportsService.queryUserBookings(req.user.email);
        return sendResponse(res, 200, true, 'Your bookings fetched.', data);
    } catch (err) {
        next(err);
    }
};

// PATCH /cancel/:id — private, owner of the booking only
export const cancelBooking = async (req, res, next) => {
    try {
        const data = await sportsService.alterBookingStatus(
            req.params.id,
            req.user.email,
        );
        if (!data) {
            return sendResponse(
                res,
                404,
                false,
                'Booking not found or unauthorized.',
            );
        }
        return sendResponse(res, 200, true, 'Booking cancelled.', data);
    } catch (err) {
        next(err);
    }
};

import { Court } from '../models/court.model.js';
import { Booking } from '../models/booking.model.js';

/**
 * List facilities with optional search + type filter.
 * Uses $regex (name search) and $in (sport type filter) per the challenge.
 */
export const queryCourts = async (search, type) => {
    const filter = {};

    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }
    if (type) {
        filter.facility_type = { $in: type.split(',').map((t) => t.trim()) };
    }

    return Court.find(filter).sort({ createdAt: -1 });
};

export const getSingleCourt = (id) => Court.findById(id);

// Facilities owned by the logged-in user (Manage My Facilities page).
export const getCourtsByOwner = (email) =>
    Court.find({ owner_email: email }).sort({ createdAt: -1 });

export const createCourtInstance = (data) => Court.create(data);

// Owner-scoped update: only the owner can modify their facility.
export const modifyCourtData = (id, email, updateData) =>
    Court.findOneAndUpdate({ _id: id, owner_email: email }, updateData, {
        new: true,
        runValidators: true,
    });

// Owner-scoped delete.
export const removeCourtInstance = (id, email) =>
    Court.findOneAndDelete({ _id: id, owner_email: email });

/**
 * Create a booking after confirming the facility exists, then increment the
 * facility's booking_count.
 */
export const processNewBooking = async (bookingData) => {
    const facility = await Court.findById(bookingData.facility_id);
    if (!facility) {
        const error = new Error('The selected facility no longer exists.');
        error.statusCode = 404;
        throw error;
    }

    const booking = await Booking.create(bookingData);
    await Court.findByIdAndUpdate(bookingData.facility_id, {
        $inc: { booking_count: 1 },
    });
    return booking;
};

export const queryUserBookings = (email) =>
    Booking.find({ user_email: email })
        .populate('facility_id')
        .sort({ createdAt: -1 });

// Owner-scoped cancel: a user can only cancel their own booking.
export const alterBookingStatus = (bookingId, email) =>
    Booking.findOneAndUpdate(
        { _id: bookingId, user_email: email },
        { status: 'cancelled' },
        { new: true },
    );

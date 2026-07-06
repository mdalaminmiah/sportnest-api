import mongoose from 'mongoose';

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'];

const bookingSchema = new mongoose.Schema(
    {
        facility_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Court',
            required: true,
        },
        user_email: { type: String, required: true, lowercase: true },
        booking_date: { type: String, required: true },
        time_slot: { type: String, required: true },
        hours: { type: Number, required: true, min: 1 },
        total_price: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: BOOKING_STATUSES,
            default: 'pending',
        },
    },
    { timestamps: true },
);

export const Booking = mongoose.model('Booking', bookingSchema);

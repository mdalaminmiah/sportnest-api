import mongoose from 'mongoose';

export const FACILITY_TYPES = [
    'Football Turf',
    'Badminton Court',
    'Swimming Lane',
    'Tennis Court',
];

const courtSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        facility_type: {
            type: String,
            required: true,
            enum: FACILITY_TYPES,
        },
        image: { type: String, required: true },
        location: { type: String, required: true, trim: true },
        price_per_hour: { type: Number, required: true, min: 1 },
        capacity: { type: Number, required: true, min: 1 },
        available_slots: {
            type: [String],
            required: true,
            validate: {
                validator: (slots) => Array.isArray(slots) && slots.length > 0,
                message: 'At least one available time slot is required.',
            },
        },
        description: { type: String, required: true, trim: true },
        owner_email: { type: String, required: true, lowercase: true },
        booking_count: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true },
);

export const Court = mongoose.model('Court', courtSchema);

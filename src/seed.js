/**
 * Seed script: populates the database with a demo owner and sample facilities
 * so the Featured / All Facilities pages have real data to render.
 *
 * Run with:  node --env-file=.env src/seed.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Court } from './models/court.model.js';
import { User } from './models/user.model.js';

const DEMO_OWNER = {
    name: 'SportNest Demo Owner',
    email: 'demo@sportnest.com',
    password: 'Passw0rd', // meets the assignment policy
};

const facilities = [
    {
        name: 'Camp Nou Turf Arena',
        facility_type: 'Football Turf',
        image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
        location: 'Stadium District, New York',
        price_per_hour: 45,
        capacity: 22,
        available_slots: ['08:00 - 10:00', '16:00 - 18:00', '20:00 - 22:00'],
        description:
            'Professional-grade floodlit football turf with premium artificial grass, changing rooms, and covered spectator seating for competitive matches.',
        booking_count: 12,
    },
    {
        name: 'Grand Slam Tennis Courts',
        facility_type: 'Tennis Court',
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
        location: 'Downtown Complex, New York',
        price_per_hour: 30,
        capacity: 4,
        available_slots: ['07:00 - 09:00', '12:00 - 14:00', '18:00 - 20:00'],
        description:
            'Hard-court tennis courts maintained to tournament standards with night lighting, umpire chairs, and on-site equipment rental.',
        booking_count: 8,
    },
    {
        name: 'AquaZone Swimming Lanes',
        facility_type: 'Swimming Lane',
        image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=800&q=80',
        location: 'Riverside Aquatic Center, New York',
        price_per_hour: 25,
        capacity: 8,
        available_slots: ['06:00 - 08:00', '10:00 - 12:00', '17:00 - 19:00'],
        description:
            'Temperature-controlled Olympic swimming lanes with certified lifeguards, lane ropes, and a dedicated warm-up pool.',
        booking_count: 15,
    },
    {
        name: 'Smash Point Badminton Hall',
        facility_type: 'Badminton Court',
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
        location: 'Midtown Sports Hub, New York',
        price_per_hour: 20,
        capacity: 4,
        available_slots: ['09:00 - 11:00', '15:00 - 17:00', '19:00 - 21:00'],
        description:
            'Indoor wooden-floor badminton courts with anti-glare lighting, professional nets, and climate control for year-round play.',
        booking_count: 6,
    },
    {
        name: 'Wembley Football Ground',
        facility_type: 'Football Turf',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        location: 'North Gate Park, New York',
        price_per_hour: 55,
        capacity: 22,
        available_slots: ['08:00 - 10:00', '14:00 - 16:00', '18:00 - 20:00'],
        description:
            'Full-size natural-hybrid football pitch with dugouts, goal nets, and a fully equipped clubhouse for teams and leagues.',
        booking_count: 20,
    },
    {
        name: 'Center Court Tennis Club',
        facility_type: 'Tennis Court',
        image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
        location: 'Lexington Avenue, New York',
        price_per_hour: 35,
        capacity: 4,
        available_slots: ['07:00 - 09:00', '13:00 - 15:00', '19:00 - 21:00'],
        description:
            'Clay tennis courts in a serene club setting, complete with a coaching academy, ball machines, and a members lounge.',
        booking_count: 9,
    },
    {
        name: 'Rally Zone Badminton Arena',
        facility_type: 'Badminton Court',
        image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&w=800&q=80',
        location: 'East Village, New York',
        price_per_hour: 22,
        capacity: 4,
        available_slots: ['10:00 - 12:00', '16:00 - 18:00', '20:00 - 22:00'],
        description:
            'Six synthetic badminton courts with sprung flooring, tournament-grade shuttles, and a spectator gallery.',
        booking_count: 4,
    },
    {
        name: 'Blue Wave Aquatic Lanes',
        facility_type: 'Swimming Lane',
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
        location: 'Harbor Point, New York',
        price_per_hour: 28,
        capacity: 6,
        available_slots: ['06:00 - 08:00', '11:00 - 13:00', '18:00 - 20:00'],
        description:
            'Indoor 25-meter heated pool with dedicated training lanes, starting blocks, and poolside coaching support.',
        booking_count: 11,
    },
];

const run = async () => {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set. Add it to your .env first.');
        process.exit(1);
    }

    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    // Ensure the demo owner exists.
    let owner = await User.findOne({ email: DEMO_OWNER.email });
    if (!owner) {
        const hashed = await bcrypt.hash(DEMO_OWNER.password, 10);
        owner = await User.create({
            name: DEMO_OWNER.name,
            email: DEMO_OWNER.email,
            password: hashed,
            role: 'player',
        });
        console.log(`✅ Created demo owner: ${DEMO_OWNER.email}`);
    } else {
        console.log(`ℹ️  Demo owner already exists: ${DEMO_OWNER.email}`);
    }

    await Court.deleteMany({ owner_email: DEMO_OWNER.email });
    const docs = facilities.map((f) => ({
        ...f,
        owner_email: DEMO_OWNER.email,
    }));
    await Court.insertMany(docs);
    console.log(`✅ Seeded ${docs.length} facilities`);

    await mongoose.connection.close();
    console.log('✅ Done. You can log in with demo@sportnest.com / Passw0rd');
    process.exit(0);
};

run().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});

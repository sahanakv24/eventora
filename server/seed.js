const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

// -------------------- DUMMY USERS --------------------

const users = [
    { name: 'Admin User', email: 'admin@eventora.com', password: 'password123', role: 'admin' },
    { name: 'Demo User', email: 'user@eventora.com', password: 'password123', role: 'user' },
    { name: 'Alice Smith', email: 'alice@eventora.com', password: 'password123', role: 'user' },
    { name: 'Bob Johnson', email: 'bob@eventora.com', password: 'password123', role: 'user' },
    { name: 'Charlie Dave', email: 'charlie@eventora.com', password: 'password123', role: 'user' },
    { name: 'Diana Prince', email: 'diana@eventora.com', password: 'password123', role: 'user' },
    { name: 'Ethan Hunt', email: 'ethan@eventora.com', password: 'password123', role: 'user' },
    { name: 'Fiona Gallagher', email: 'fiona@eventora.com', password: 'password123', role: 'user' },
    { name: 'George Miller', email: 'george@eventora.com', password: 'password123', role: 'user' },
    { name: 'Hannah Montana', email: 'hannah@eventora.com', password: 'password123', role: 'user' }
];

// -------------------- DUMMY EVENTS --------------------

const events = [
    {
        title: 'React & Node.js Developer Retreat',
        description: 'A technology event for developers to learn React and Node.js.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Silicon Valley Innovation Center, CA',
        category: 'Technology',
        totalSeats: 200,
        availableSeats: 200,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Neon Nights EDM Festival',
        description: 'Enjoy an exciting electronic dance music festival.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: 'Grand Arena, New York',
        category: 'Music',
        totalSeats: 500,
        availableSeats: 500,
        ticketPrice: 1500,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Global Leaders Business Summit',
        description: 'A business summit bringing together global leaders.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'The Ritz-Carlton, London',
        category: 'Business',
        totalSeats: 150,
        availableSeats: 150,
        ticketPrice: 5000,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Modern Art Expo 2024',
        description: 'Explore creative artwork and modern art exhibitions.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Downtown Art Museum',
        category: 'Art',
        totalSeats: 300,
        availableSeats: 300,
        ticketPrice: 200,
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup Pitch Competition',
        description: 'An event where startups present their business ideas.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Convention Center, Miami',
        category: 'Business',
        totalSeats: 250,
        availableSeats: 250,
        ticketPrice: 100,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud Computing Architecture Seminar',
        description: 'Learn about cloud computing and modern architectures.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: 'Tech Hub, Seattle',
        category: 'Technology',
        totalSeats: 100,
        availableSeats: 100,
        ticketPrice: 600,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    }
];

// -------------------- SEED DATABASE --------------------

const seedDatabase = async () => {
    try {
        // Connect to MongoDB Atlas
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from your .env file');
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log('\nMongoDB connection open...');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        await Booking.deleteMany({});

        console.log('Existing users, events and bookings cleared.');

        // Hash passwords
        const salt = await bcrypt.genSalt(10);

        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, salt),
                isVerified: true
            }))
        );

        // Insert users
        const createdUsers = await User.insertMany(hashedUsers);

        const adminUser = createdUsers.find(
            user => user.role === 'admin'
        );

        const normalUsers = createdUsers.filter(
            user => user.role === 'user'
        );

        console.log(`Created ${createdUsers.length} dummy users.`);

        // Add admin ID to events
        const eventsWithAdmin = events.map(event => ({
            ...event,
            createdBy: adminUser._id
        }));

        // Insert events
        const createdEvents = await Event.insertMany(eventsWithAdmin);

        console.log(`Created ${createdEvents.length} events.`);

        // -------------------- CREATE BOOKINGS --------------------

        const bookingsData = [];

        for (const event of createdEvents) {

            // Select 3 to 6 random users
            const randomCount = Math.floor(Math.random() * 4) + 3;

            const shuffledUsers = [...normalUsers].sort(
                () => 0.5 - Math.random()
            );

            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (const user of selectedUsers) {

                const statuses = ['pending', 'confirmed', 'cancelled'];

                const status = statuses[
                    Math.floor(Math.random() * statuses.length)
                ];

                let paymentStatus = 'not_paid';

                if (status === 'confirmed' && event.ticketPrice > 0) {
                    paymentStatus = Math.random() > 0.1
                        ? 'paid'
                        : 'not_paid';
                } else if (event.ticketPrice === 0) {
                    paymentStatus = 'paid';
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    status: status,
                    paymentStatus: paymentStatus,
                    amount: event.ticketPrice
                });

                // Reduce available seats for confirmed bookings
                if (status === 'confirmed') {
                    event.availableSeats -= 1;
                    await event.save();
                }
            }
        }

        // Insert bookings
        await Booking.insertMany(bookingsData);

        console.log(`Created ${bookingsData.length} dummy bookings.`);

        console.log('\n================================');
        console.log('DATABASE SEEDED SUCCESSFULLY!');
        console.log('================================');

        console.log('\nADMIN LOGIN DETAILS');
        console.log('Email: admin@eventora.com');
        console.log('Password: password123');

        console.log('\nUSER LOGIN DETAILS');
        console.log('Email: user@eventora.com');
        console.log('Password: password123');

        console.log('\nTotal Users:', createdUsers.length);
        console.log('Total Events:', createdEvents.length);
        console.log('Total Bookings:', bookingsData.length);

    } catch (error) {
        console.error('\nError seeding database:', error);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
        console.log('\nMongoDB connection closed.');
    }
};

seedDatabase();''
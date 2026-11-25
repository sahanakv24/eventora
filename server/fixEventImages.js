const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const Event = require('./models/Event');

const updateImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB connected...');

        const imageUpdates = [
            {
                title: 'React & Node.js Developer Retreat',
                image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Neon Nights EDM Festival',
                image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Global Leaders Business Summit',
                image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Modern Art Expo 2024',
                image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Startup Pitch Competition',
                image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
            },
            {
                title: 'Cloud Computing Architecture Seminar',
                image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
            }
        ];

        for (const event of imageUpdates) {

            const result = await Event.updateOne(
                { title: event.title },
                { $set: { image: event.image } }
            );

            console.log(
                `${event.title}: ${result.modifiedCount} updated`
            );
        }

        console.log('\nAll event images updated successfully!');

    } catch (error) {
        console.error('Error:', error);

    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

updateImages();
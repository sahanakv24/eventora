const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");
const authRoutes = require("./routes/auth.js");
const eventRoutes = require("./routes/events.js");
const bookingRoutes = require("./routes/booking.js")

// Use Google's DNS servers for Node.js DNS lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

// Test API route
app.get("/", (req, res) => {
    res.send("EVENTORA API is running");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from the .env file");
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected Database:", mongoose.connection.name);
        console.log("Connected Cluster:", mongoose.connection.host);

        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
    }
}

startServer();


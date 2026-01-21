const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Counter = require("./models/counter");
const Event = require("./models/event");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smartq";

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await User.deleteMany({});
        await Counter.deleteMany({});
        await Event.deleteMany({});

        // Create Admin
        const adminPassword = await bcrypt.hash("admin123", 10);
        const admin = new User({
            username: "admin",
            password: adminPassword,
            role: "admin"
        });
        await admin.save();
        console.log("Admin user created: admin / admin123");

        // Create Counters
        const counters = [
            { number: "Counter 1", status: "Active", serviceType: "General Checkup" },
            { number: "Counter 2", status: "Active", serviceType: "Account Opening" },
            { number: "Counter 3", status: "Inactive", serviceType: "Consultation" }
        ];
        await Counter.insertMany(counters);
        console.log("Initial counters created.");

        // Create Sample Events
        const events = [
            {
                title: "Health Awareness Camp",
                organization: "Healthcare",
                date: "2026-02-15",
                time: "10:00 AM",
                location: "Main Auditorium"
            },
            {
                title: "Digital Banking Workshop",
                organization: "Banking",
                date: "2026-02-20",
                time: "02:00 PM",
                location: "Conference Room B"
            }
        ];
        await Event.insertMany(events);
        console.log("Initial events created.");

        console.log("Seeding completed successfully!");
        process.exit();
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedData();

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import pingUserURLs from './runner/runner.js';
import cron from "node-cron";

dotenv.config();

const app = express();

const allowedOrigins = [
    '',
]
const corsOption = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.split(',').includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}
app.use(cors()); // add corsOptions on deployment
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
    console.log(`Alpha Server running on port: ${PORT}`);
    await connectDB();
});

cron.schedule("* * * * *", pingUserURLs);
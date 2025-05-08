import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import { cacheUserUrls, pingUserURLs } from './runner/runner.js';
import cron from "node-cron";

dotenv.config();

const app = express();

const allowedOrigins = [
    '',
]

const corsOption = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
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

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'index.html'));
    res.send("<h1 style='text-align: center'>Beta Server is running</h1>");
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
    console.log(`Beta Server running on port: ${PORT}`);
    await connectDB();

    console.log("[STARTUP] Running initial cacheUserUrls()");
    await cacheUserUrls();
    console.log("[STARTUP] Finished initial cacheUserUrls()");
});

cron.schedule("*/15 * * * *", async () => {
    console.log("[CRON] Running cacheUserUrls()");
    await cacheUserUrls();
    console.log("[CRON] Finished cacheUserUrls()");
});

cron.schedule("* * * * *", async () => {
    console.log("[CRON] Running pingUserURLs()");
    await pingUserURLs();
    console.log("[CRON] Finished pingUserURLs()");
});
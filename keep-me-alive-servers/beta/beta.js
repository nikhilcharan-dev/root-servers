import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from "axios";
import cron from "node-cron";

import connectDB from './config/db.js';
import scheduler from './runner/runner.js';

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

app.use('/api/start', runners);

app.get('/health', (req, res) => {
    res.send('OK');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
    console.log(`Beta Server running on port: ${PORT}`);
    startServer();
})

const startServer = async () => {
    try {
        await connectDB();
        await scheduler();
    } catch (err) {
        console.error('Error connecting to MongoDB or starting scheduler:', err);
    }
}

cron.schedule("*/5 * * * *", async () => {
    await axios.get(`${process.env.ALPHA_SERVER}/health`);
})
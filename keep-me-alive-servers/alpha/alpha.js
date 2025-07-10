import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import runners from './runner/runner.js';

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
    res.send("<h1 style='text-align: center'>Alpha Server is running</h1>");
});

app.use('/api/start', runners);

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
    console.log(`Alpha Server running on port: ${PORT}`);
    await connectDB();
});
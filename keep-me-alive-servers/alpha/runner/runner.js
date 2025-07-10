import User from '../models/user.js';
import express from "express";

const router = express.Router();

router.get('/ping', async (req, res) => {
    try {
        const users = await User.find({ worker: "alpha"});
        return res.status(200).json(users);
    } catch(err) {
        console.error(err);
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
});

export default router;
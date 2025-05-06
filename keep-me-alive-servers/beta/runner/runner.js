import redis from "../config/redis.js";
import axios from "axios";
import User from "../models/user.js";


const pingUserURLs = async () => {
    const keys = await redis.keys("user:beta:*");
    const now = Date.now();

    for (const key of keys) {
        const cached = await redis.get(key);
        if (!cached) continue;

        const user = JSON.parse(cached);
        if (now >= new Date(user.nextPingAt).getTime() || 1) {
            // Ping all URLs
            for (const url of user.urls) {
                try {
                    await axios.get(`http://${url}`);
                    console.log(`Pinged ${url} for user ${key}`);
                } catch {
                    console.log(`Failed to ping ${url}`);
                }
            }

            // Calculate next ping time
            const nextPingAt = new Date(now + user.pingRange * 60 * 1000);

            // Update Redis and MongoDB
            user.nextPingAt = nextPingAt;

            await redis.set(key, JSON.stringify(user), 'EX', 86400);
            await User.findByIdAndUpdate(user._id, { nextPingAt });
        }
    }
};

export default pingUserURLs;

import redis from "../config/redis.js";
import axios from "axios";
import User from "../models/user.js";


const pingUserURLs = async () => {
    const isCaching = await redis.get("cache:in_progress");
    if (isCaching) {
        console.log("[PING] Skipped: cache in progress");
        return;
    }

    const keys = await redis.keys("user:alpha:*");
    const now = Date.now();

    for (const key of keys) {
        const cached = await redis.get(key);
        if (!cached) continue;

        const user = JSON.parse(cached);
        console.log(`[PING] Checking user ${user._id}, next ping at ${new Date(user.nextPingAt).toISOString()}`);

        if (now >= new Date(user.nextPingAt).getTime()) {
            for (const url of user.urls) {
                try {
                    await axios.get(`http://${url}`);
                    console.log(`[PING] Pinged ${url}`);
                } catch {
                    console.log(`[PING] Failed to ping ${url}`);
                }
            }

            const nextPingAt = new Date(now + user.pingRange * 60 * 1000);
            user.nextPingAt = nextPingAt;

            await redis.set(key, JSON.stringify(user), 'EX', 86400);
            await User.findByIdAndUpdate(user._id, { nextPingAt });

            console.log(`[PING] Updated next ping for user ${user._id}`);
        } else {
            console.log(`[PING] Skipped user ${user._id}, next ping at ${new Date(user.nextPingAt).toISOString()}`);
        }
    }
};


const cacheUserUrls = async () => {
    await redis.set("cache:in_progress", "1", 'EX', 60, 'NX');

    try {
        console.log(`[CACHE] Started at ${new Date().toISOString()}`);

        const users = await User.find({ worker: 'alpha'}).lean();
        for (const user of users) {
            const key = `user:${user.worker}:${user._id}`;
            await redis.set(key, JSON.stringify({
                _id: user._id,
                urls: user.urls,
                pingRange: user.pingRange,
                nextPingAt: user.nextPingAt,
                worker: user.worker
            }), 'EX', 86400);
            console.log(`[CACHE] Updated cache for user ${user._id}`);
        }

        console.log(`[CACHE] Completed at ${new Date().toISOString()}`);
    } catch (err) {
        console.error("[CACHE] Error:", err.message);
    } finally {
        await redis.del("cache:in_progress");
    }
};

export { cacheUserUrls, pingUserURLs };

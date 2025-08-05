import User from '../models/user.js';
import axios from 'axios';
import cron from "node-cron";

const scheduledJobs = new Map();

const convertToCron = (min) => `*/${min} * * * *`;

async function createOrUpdateJob(user, url) {
    const jobKey = url._id.toString();

    // If jb exists, cancel it
    if (scheduledJobs.has(jobKey)) {
        const existingJob = scheduledJobs.get(jobKey);
        existingJob.stop();
        scheduledJobs.delete(jobKey);
        console.log(`Rescheduled job for ${url.address}`);
    } else {
        console.log(`New job scheduled for ${url.address}`);
    }

    const cronExp = convertToCron(url.pingFrequency);

    const task = cron.schedule(cronExp, async () => {
        try {
            console.log(`Pinging ${url.address}`);
            await axios.get(`https://${url.address}`);
            await User.updateOne(
                { _id: user._id, 'urls._id': url._id },
                { $set: { 'urls.$.status': 'UP' } }
            );
        } catch (err) {
            console.error(`Error pinging ${url.address}: ${err.message}`);
            await User.updateOne(
                { _id: user._id, 'urls._id': url._id },
                { $set: { 'urls.$.status': 'DOWN' } }
            );
        }
    });

    scheduledJobs.set(jobKey, task);
}

async function reloadJobs() {
    try {
        const users = await User.find({ worker: "beta" });

        const activeJobKeys = new Set();

        users.forEach((user) => {
            user.urls.forEach((url) => {
                if (!url.address || !url.pingFrequency) {
                    console.warn(`Missing data for URL entry, skipping`);
                    return;
                }
                // creating jbs
                createOrUpdateJob(user, url);
                activeJobKeys.add(url._id.toString());
            });
        });

        // cleaning jbs that are no longer in DB
        for (const jobKey of scheduledJobs.keys()) {
            if (!activeJobKeys.has(jobKey)) {
                console.log(`Removing deleted job for ID: ${jobKey}`);
                scheduledJobs.get(jobKey).stop();
                scheduledJobs.delete(jobKey);
            }
        }

    } catch (err) {
        console.error('Error reloading jobs:', err);
    }
}

export default async function scheduler() {
    console.log('Scheduler starting...');

    await reloadJobs();

    // Polling loop to watch for updates every minute
    setInterval(() => {
        console.log('Checking for updates in MongoDB...');
        reloadJobs();
    }, 1000);
}

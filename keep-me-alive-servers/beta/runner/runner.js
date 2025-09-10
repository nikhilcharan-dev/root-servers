import User from '../models/user.js';
import cron from "node-cron";
import express from "express";

export const router = express.Router();

let Users = [];
let UpdatedUsers = [];

const convertToCron = (min) => `*/${min} * * * *`;

const start = async () => {
    try {
        const users = await User.find({ worker: "beta" });
        UpdatedUsers = Users = users;
    } catch(err) {
        console.log(err);
    }
}

const process = async () => {
    try {
        let allURLS = [];
        Users.map((user) => {
            user.urls.map((url) => {
                allURLS.push(`https://${url.address}`);
            })
        })

        await Promise.all(
            allURLS.map((url) => {
                fetch(url)
            })
        );
        console.log("Monitoring Done")
    } catch(err) {
        console.log(err);
    }
}

const checkUpdates = () => {
    Users = UpdatedUsers;
}

export const scheduler = async () => {
    console.log('Scheduler starting...');
    await start();
    cron.schedule(convertToCron(5), async () => {
        checkUpdates();
        await process();
    })
}

const restart = async () => {
    try {
        UpdatedUsers = await User.find({
            worker: "beta",
        });
    } catch(err) {
        console.log(err);
    }
}

router.post('/edit-process', async (req, res) => {
    try {
        await restart();
    } catch(err) {
        console.log(err);
    }
})

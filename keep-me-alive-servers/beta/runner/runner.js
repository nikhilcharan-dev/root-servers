import User from '../models/user.js';
import axios from 'axios';
import cron from "node-cron";
import express from "express";

const router = express.Router();

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
        Users.map((user) => {
            user.urls.map(async (url) => {
                try { await axios.get(url); }
                catch(err) {
                    console.log(`Error while Pinging [${url}]`, err);
                }
            })
        })
    } catch(err) {
        console.log(err);
    }
}

const checkUpdates = () => {

}

export default async function scheduler() {
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

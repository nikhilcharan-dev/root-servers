import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    urls: [{ type: String }],
    worker: {
        type: String,
        required: true
    },
    pingRange: {
        type: Number,
        required: true
    },
    nextPingAt: {
        type: Date,
        required: true
    }

}, { timestamps: true });

const User = mongoose.model("user", userSchema);
export default User;
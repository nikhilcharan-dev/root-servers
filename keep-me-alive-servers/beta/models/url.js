import mongoose from 'mongoose';

const UrlSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    pingFrequency: {
        type: Number,
        required: true,
        min: 5,
        max: 30,
    },
    status: String
})

export default UrlSchema;
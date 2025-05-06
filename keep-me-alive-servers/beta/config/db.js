import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const dbURI = process.env.MONGODB_URI;
        await mongoose.connect(dbURI, { });
        console.log("MongoDB connected successfully");
    } catch(err) {
        console.error("MongoDB connection error", err);
    }
}

export default connectDB;

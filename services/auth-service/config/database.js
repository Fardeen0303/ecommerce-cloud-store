import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Auth DB connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.log(`Auth DB connection error: ${error}`);
    }
};

export default connectDB;

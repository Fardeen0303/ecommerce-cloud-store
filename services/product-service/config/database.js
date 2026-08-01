import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Product DB connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.log(`Product DB connection error: ${error}`);
    }
};

export default connectDB;

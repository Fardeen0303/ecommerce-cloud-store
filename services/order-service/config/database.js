import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Order DB connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.log(`Order DB connection error: ${error}`);
    }
};

export default connectDB;

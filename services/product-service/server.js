import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";
import connectDB from "./config/database.js";
import productRoute from "./routes/productRoute.js";

dotenv.config();
const app = express();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));

connectDB();

app.use("/api/v1/product", productRoute);

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));

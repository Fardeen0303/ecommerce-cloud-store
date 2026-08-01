//packages
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";

//local imports
import connectDB from "./config/database.js";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";

//rest object
const app = express();

//configure env
dotenv.config();

//configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

//middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan("dev"));
app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    })
);
//connect DB
connectDB();

//port
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("Hello there!");
});

//routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/user", userRoute);

app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoute from "./routes/authRoute.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/api/v1/auth", authRoute);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));

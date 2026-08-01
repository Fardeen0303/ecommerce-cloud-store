import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/database.js";
import orderRoute from "./routes/orderRoute.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/api/v1/user", orderRoute);

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));

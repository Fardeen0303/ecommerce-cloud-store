import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

const AUTH_SERVICE    = process.env.AUTH_SERVICE_URL    || "http://localhost:8081";
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || "http://localhost:8082";
const ORDER_SERVICE   = process.env.ORDER_SERVICE_URL   || "http://localhost:8083";

app.use("/api/v1/auth",    createProxyMiddleware({ target: AUTH_SERVICE,    changeOrigin: true }));
app.use("/api/v1/product", createProxyMiddleware({ target: PRODUCT_SERVICE, changeOrigin: true }));
app.use("/api/v1/user",    createProxyMiddleware({ target: ORDER_SERVICE,   changeOrigin: true }));

app.get("/", (req, res) => res.send("API Gateway running"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));

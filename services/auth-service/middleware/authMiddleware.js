import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import UserModel from "../models/userModel.js";

export const requireSignIn = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: "JWT must be provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserModel.findById(decoded._id);
        if (!req.user) return res.status(401).json({ message: "Unauthorised User" });
        next();
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
});

export const isAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: "JWT must be provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserModel.findById(decoded._id);
        if (!req.user || req.user.role !== 1)
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        next();
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
});

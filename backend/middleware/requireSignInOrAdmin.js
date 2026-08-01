import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import UserModel from "../models/userModel.js";

const requireSignInOrAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "JWT must be provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserModel.findById(decoded._id);

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorised User" });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

export default requireSignInOrAdmin;

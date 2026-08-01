import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// Lightweight middleware: validates JWT without hitting DB
// For DB-level user checks, call auth-service internal endpoint
const verifyToken = (token) => {
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
};

export const requireSignIn = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: "Unauthorised User" });
    req.user = decoded;
    next();
});

export const isAdmin = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: "JWT must be provided" });

    // Verify admin role via auth-service
    try {
        const response = await fetch(`${process.env.AUTH_SERVICE_URL}/api/v1/auth/internal/user/${decoded._id}`);
        const data = await response.json();
        if (!data.success || data.user.role !== 1)
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        req.user = data.user;
        next();
    } catch {
        return res.status(500).json({ message: "Auth service unavailable" });
    }
});

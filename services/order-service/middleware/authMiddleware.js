import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

const verifyToken = (token) => {
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
};

const fetchUser = async (id) => {
    try {
        const res = await fetch(`${process.env.AUTH_SERVICE_URL}/api/v1/auth/internal/user/${id}`);
        const data = await res.json();
        return data.success ? data.user : null;
    } catch {
        return null;
    }
};

export const requireSignIn = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: "Unauthorised User" });
    const user = await fetchUser(decoded._id);
    if (!user) return res.status(401).json({ message: "Unauthorised User" });
    req.user = user;
    next();
});

export const isAdmin = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: "JWT must be provided" });
    const user = await fetchUser(decoded._id);
    if (!user || user.role !== 1)
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    req.user = user;
    next();
});

export const requireSignInOrAdmin = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: "JWT must be provided" });
    const user = await fetchUser(decoded._id);
    if (!user) return res.status(401).json({ message: "Unauthorised User" });
    req.user = user;
    next();
});

import express from "express";
import { requireSignIn, isAdmin, requireSignInOrAdmin } from "../middleware/authMiddleware.js";
import {
    createCODOrder, createPayPalOrder, capturePayPalOrder,
    createRazorpayOrder, verifyRazorpayPayment, createSession,
    getOrders, getOrderDetail, getAdminOrders, getAllUserOrder,
    cancelOrder, updateOrder, verifyPayment, deleteAllOrders,
} from "../controllers/orderControllers.js";

const router = express.Router();

// Payment
router.post("/create-cod-order", requireSignIn, createCODOrder);
router.post("/create-razorpay-order", requireSignIn, createRazorpayOrder);
router.post("/verify-razorpay-payment", requireSignIn, verifyRazorpayPayment);
router.post("/create-paypal-order", requireSignIn, createPayPalOrder);
router.post("/capture-paypal-order", requireSignIn, capturePayPalOrder);
router.post("/create-session", requireSignIn, createSession);

// User orders
router.get("/orders", requireSignIn, getOrders);
router.get("/order-detail", requireSignIn, getOrderDetail);
router.patch("/cancel-order", requireSignInOrAdmin, cancelOrder);
router.get("/get-all-order", requireSignIn, getAllUserOrder);

// Admin orders
router.get("/admin-orders", isAdmin, getAdminOrders);
router.get("/admin-order-detail", isAdmin, getOrderDetail);
router.patch("/update/order-status", isAdmin, updateOrder);
router.patch("/verify-payment", isAdmin, verifyPayment);
router.delete("/delete-all-orders", isAdmin, deleteAllOrders);

export default router;

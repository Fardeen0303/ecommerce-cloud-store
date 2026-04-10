import express from "express";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";
import requireSignInOrAdmin from "../middleware/requireSignInOrAdmin.js";
import getWishlistItems from "../controllers/user/getWishlistItems.js";
import updateWishlist from "../controllers/user/updateWishlist.js";
import getWishlistProducts from "../controllers/user/getWishlistProducts.js";
import createCODOrder from "../controllers/user/createCODOrder.js";
import createRazorpayOrder from "../controllers/user/createRazorpayOrder.js";
import verifyRazorpayPayment from "../controllers/user/verifyRazorpayPayment.js";
import createPayPalOrder from "../controllers/user/createPayPalOrder.js";
import capturePayPalOrder from "../controllers/user/capturePayPalOrder.js";
import verifyPayment from "../controllers/user/verifyPayment.js";
import cancelOrder from "../controllers/user/cancelOrder.js";
import getOrders from "../controllers/user/getOrders.js";
import getOrderDetail from "../controllers/user/getOrderDetail.js";
import getAdminOrders from "../controllers/user/getAdminOrders.js";
import updateOrder from "../controllers/user/updateOrder.js";
import getAllUserOrder from "../controllers/user/getAllUserOrder.js";
import deleteAllOrders from "../controllers/user/deleteAllOrders.js";

//router object
const router = express.Router();

//routing
//get Wishlist Items id
router.get("/wishlist", requireSignIn, getWishlistItems);

//update wishlist Items
router.post("/update-wishlist", requireSignIn, updateWishlist);

// get wishlist products
router.get("/wishlist-products", requireSignIn, getWishlistProducts);

router.post("/create-cod-order", requireSignIn, createCODOrder);
router.post("/create-razorpay-order", requireSignIn, createRazorpayOrder);
router.post("/verify-razorpay-payment", requireSignIn, verifyRazorpayPayment);
router.post("/create-paypal-order", requireSignIn, createPayPalOrder);
router.post("/capture-paypal-order", requireSignIn, capturePayPalOrder);

// get user orders
router.get("/orders", requireSignIn, getOrders);
router.get("/order-detail", requireSignIn, getOrderDetail);
router.patch("/cancel-order", requireSignInOrAdmin, cancelOrder);

//get admin orders
router.get("/admin-orders", isAdmin, getAdminOrders);
router.get("/admin-order-detail", isAdmin, getOrderDetail);

//update order status
router.patch("/update/order-status", isAdmin, updateOrder);
router.patch("/verify-payment", isAdmin, verifyPayment);

//get all order and delete if possible
router.get("/get-all-order", requireSignIn, getAllUserOrder);
router.delete("/delete-all-orders", isAdmin, deleteAllOrders);
export default router;

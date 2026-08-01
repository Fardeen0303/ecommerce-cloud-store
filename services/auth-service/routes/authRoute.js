import express from "express";
import {
    registerController,
    loginController,
    userCheckController,
    forgotPasswordController,
    updateDetailsController,
    deactivateController,
    getInternalUser,
    removeWishlistProduct,
} from "../controllers/authControllers.js";
import { getWishlistItems, updateWishlist, getWishlistProducts } from "../controllers/wishlistControllers.js";
import { requireSignIn, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/user-exist", userCheckController);
router.post("/forgot-password", forgotPasswordController);
router.post("/update-details", updateDetailsController);
router.post("/deactivate", deactivateController);

router.get("/user-auth", requireSignIn, (req, res) => res.status(200).send({ ok: true }));
router.get("/admin-auth", isAdmin, (req, res) => res.status(200).send({ ok: true }));

// Wishlist routes (moved from order-service since they belong to user data)
router.get("/user/wishlist", requireSignIn, getWishlistItems);
router.post("/user/update-wishlist", requireSignIn, updateWishlist);
router.get("/user/wishlist-products", requireSignIn, getWishlistProducts);

// Internal routes for inter-service communication
router.get("/internal/user/:id", getInternalUser);
router.post("/internal/remove-wishlist-product", removeWishlistProduct);

export default router;

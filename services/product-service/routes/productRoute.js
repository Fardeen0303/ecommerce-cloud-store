import express from "express";
import { requireSignIn, isAdmin } from "../middleware/authMiddleware.js";
import {
    newProduct, findProduct, updateProduct, deleteProduct,
    getFilteredProducts, searchProductController, addReview, getSellerProducts,
    getBanners, getAllBanners, addBanner, toggleBanner, deleteBanner,
    reduceStock, restoreStock,
} from "../controllers/productControllers.js";

const router = express.Router();

router.post("/new-product", isAdmin, newProduct);
router.get("/seller-product", isAdmin, getSellerProducts);
router.post("/delete-product", isAdmin, deleteProduct);
router.get("/filtered-products", getFilteredProducts);

router.get("/banners/all", getBanners);
router.get("/banners/admin", isAdmin, getAllBanners);
router.post("/banners/add", isAdmin, addBanner);
router.patch("/banners/toggle/:id", isAdmin, toggleBanner);
router.delete("/banners/delete/:id", isAdmin, deleteBanner);

router.patch("/update/:id", isAdmin, updateProduct);
router.get("/search/:keyword", searchProductController);
router.post("/review", requireSignIn, addReview);

// Internal routes for inter-service communication
router.post("/internal/reduce-stock", reduceStock);
router.post("/internal/restore-stock", restoreStock);

router.get("/:id", findProduct);

export default router;

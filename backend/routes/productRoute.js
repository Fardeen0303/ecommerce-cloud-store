import express from "express";
import { requireSignIn, isAdmin } from "../middleware/authMiddleware.js";
import newProduct from "../controllers/product/newProduct.js";
import getSellerProducts from "../controllers/product/getSellerProducts.js";
import deleteProduct from "../controllers/product/deleteProduct.js";
import findProduct from "../controllers/product/findProduct.js";
import updateProduct from "../controllers/product/updateProduct.js";
import getFilteredProducts from "../controllers/product/getFilteredProducts.js";
import searchProductController from "../controllers/product/searchProductController.js";
import addReview from "../controllers/product/addReview.js";
import getBanners from "../controllers/product/getBanners.js";
import addBanner from "../controllers/product/addBanner.js";
import deleteBanner from "../controllers/product/deleteBanner.js";
import getAllBanners from "../controllers/product/getAllBanners.js";
import toggleBanner from "../controllers/product/toggleBanner.js";

//router object
const router = express.Router();

//Add new product POST
router.post("/new-product", isAdmin, newProduct);

//Get Seller Product
router.get("/seller-product", isAdmin, getSellerProducts);

//Delete Product
router.post("/delete-product", isAdmin, deleteProduct);

//find filtered product
router.get("/filtered-products", getFilteredProducts);

// Banner routes (MUST be before /:id route)
router.get("/banners/all", getBanners);
router.get("/banners/admin", isAdmin, getAllBanners);
router.post("/banners/add", isAdmin, addBanner);
router.patch("/banners/toggle/:id", isAdmin, toggleBanner);
router.delete("/banners/delete/:id", isAdmin, deleteBanner);

//update product details from product id
router.patch("/update/:id", isAdmin, updateProduct);

// search products using keyword
router.get("/search/:keyword", searchProductController);

// add/update product review
router.post("/review", requireSignIn, addReview);

//find product details from product id (must be last)
router.get("/:id", findProduct);

export default router;

import productModel from "../models/productModel.js";
import bannerModel from "../models/bannerModel.js";
import cloudinary, { v2 as cloudinaryV2 } from "cloudinary";

// ─── Product Controllers ───────────────────────────────────────────────────

export const newProduct = async (req, res) => {
    try {
        let images = typeof req.body.images === "string" ? [req.body.images] : req.body.images;
        const imagesLink = [];

        for (let i = 0; i < images?.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], { folder: "products", resource_type: "auto" });
            imagesLink.push({ public_id: result.public_id, url: result.secure_url });
        }

        const logoResult = await cloudinary.v2.uploader.upload(req.body.logo, { folder: "brands", resource_type: "auto" });
        req.body.brand = { name: req.body.brandName, logo: { public_id: logoResult.public_id, url: logoResult.secure_url } };
        req.body.images = imagesLink;
        req.body.seller = req.user._id;

        let specs = [];
        req.body.specifications.forEach((s) => specs.push(JSON.parse(s)));
        req.body.specifications = specs;

        const product = await productModel.create(req.body);
        res.status(201).send({ success: true, product });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in adding New Product", error: error.message });
    }
};

export const findProduct = async (req, res) => {
    try {
        const response = await productModel.findById(req.params.id);
        if (!response) return res.status(401).send({ success: false, errorType: "productNotFound", message: "Product Not Found" });
        res.status(201).send({ success: true, message: "Product Fetched Successfully", product: response });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Finding Product", error });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) return res.status(401).send({ success: false, message: "No Product Found", errorType: "productNotFound" });

        let publicIdToDelete = req.body.removedImages;
        if (typeof publicIdToDelete === "string") {
            await cloudinary.v2.uploader.destroy(publicIdToDelete);
        } else if (Array.isArray(publicIdToDelete) && publicIdToDelete.length > 0) {
            await Promise.all(publicIdToDelete.map((id) => cloudinary.v2.uploader.destroy(id)));
        }

        const images = Array.isArray(req.body.images) ? req.body.images : req.body.images ? [req.body.images] : [];
        const imagesLink = [];
        for (const image of images) {
            const result = await cloudinary.v2.uploader.upload(image, { folder: "products" });
            imagesLink.push({ public_id: result.public_id, url: result.secure_url });
        }

        const oldLogo = req.body.oldLogo ? JSON.parse(req.body.oldLogo) : null;
        let brandLogo = null;
        if (req.body.logo && req.body.logo !== "null") {
            const result = await cloudinary.v2.uploader.upload(req.body.logo, { folder: "brands" });
            brandLogo = { public_id: result.public_id, url: result.secure_url };
        }

        product.brand = { name: req.body.brandName, logo: brandLogo || oldLogo };
        const oldImages = req.body.oldImages ? JSON.parse(req.body.oldImages) : [];
        product.images = [...oldImages, ...imagesLink];
        product.name = req.body.name || product.name;
        product.warranty = req.body.warranty || product.warranty;
        product.stock = req.body.stock || product.stock;
        product.category = req.body.category || product.category;
        product.description = req.body.description || product.description;
        product.price = req.body.price || product.price;
        product.discountPrice = req.body.discountPrice || product.discountPrice;
        product.ratings = req.body.ratings || product.ratings;
        product.highlights = req.body.highlights || product.highlights;
        if (Array.isArray(req.body.specifications)) {
            product.specifications = req.body.specifications.map((s) => JSON.parse(s));
        }

        const updatedProduct = await product.save();
        res.status(201).send({ success: true, updatedProduct });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Updating Product", error });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const response = await productModel.findByIdAndDelete(productId);
        if (!response) return res.status(401).send({ success: false, errorType: "productNotFound", message: "Product Not Found" });

        // Notify auth-service to remove from wishlists (fire-and-forget)
        fetch(`${process.env.AUTH_SERVICE_URL}/api/v1/auth/internal/remove-wishlist-product`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
        }).catch(() => {});

        res.status(201).send({ success: true, message: "Product Deleted Successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Deleting Product", error });
    }
};

export const getFilteredProducts = async (req, res) => {
    try {
        const { category, priceRange, ratings } = req.query;
        let products = await productModel.find({}).sort({ createdAt: -1 });

        if (category) products = products.filter((p) => p.category === category);
        if (priceRange && priceRange.length === 2) {
            const minPrice = Number(priceRange[0]);
            const maxPrice = Number(priceRange[1]);
            products = products.filter((p) => p.discountPrice >= minPrice && p.discountPrice <= maxPrice);
        }
        if (ratings && Number(ratings) > 0) {
            const exactRating = Number(ratings);
            products = products.filter((p) => Math.round(p.ratings) === exactRating);
        }

        res.status(201).send({ success: true, products });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in getting Filtered Products", error });
    }
};

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const products = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ],
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Searching Products", error });
    }
};

export const addReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;
        const userId = req.user._id;
        const userName = req.user.name;

        const product = await productModel.findById(productId);
        if (!product) return res.status(404).send({ success: false, message: "Product not found" });

        const isReviewed = product.reviews.find((r) => r.user.toString() === userId.toString());
        if (isReviewed) {
            product.reviews.forEach((r) => {
                if (r.user.toString() === userId.toString()) {
                    r.rating = rating;
                    r.comment = comment;
                }
            });
        } else {
            product.reviews.push({ user: userId, name: userName, rating: Number(rating), comment });
            product.numOfReviews = product.reviews.length;
        }

        let totalRating = 0;
        product.reviews.forEach((r) => (totalRating += r.rating));
        product.ratings = totalRating / product.reviews.length;

        await product.save();
        res.status(201).send({ success: true, message: "Review added successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in adding review", error: error.message });
    }
};

export const getSellerProducts = async (req, res) => {
    try {
        const products = await productModel.find({ seller: req.user._id });
        res.status(201).send({ success: true, products });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in getting All Products", error });
    }
};

// Internal route: reduce stock after order
export const reduceStock = async (req, res) => {
    try {
        const { items } = req.body; // [{ productId, quantity }]
        for (const item of items) {
            const product = await productModel.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
        }
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error reducing stock" });
    }
};

// Internal route: restore stock on cancel
export const restoreStock = async (req, res) => {
    try {
        const { items } = req.body;
        for (const item of items) {
            const product = await productModel.findById(item.productId);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error restoring stock" });
    }
};

// ─── Banner Controllers ────────────────────────────────────────────────────

export const getBanners = async (req, res) => {
    try {
        const banners = await bannerModel.find({ isActive: true }).sort({ order: 1 });
        res.status(200).send({ success: true, banners });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in getting banners", error });
    }
};

export const getAllBanners = async (req, res) => {
    try {
        const banners = await bannerModel.find({}).sort({ order: 1 });
        res.status(200).send({ success: true, banners });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in getting all banners", error });
    }
};

export const addBanner = async (req, res) => {
    try {
        const { category, order } = req.body;
        const file = req.files?.image;
        if (!file || !category) return res.status(400).send({ success: false, message: "Image and category are required" });

        const result = await cloudinaryV2.uploader.upload(file.tempFilePath, { folder: "banners" });
        const banner = await bannerModel.create({
            image: { public_id: result.public_id, url: result.secure_url },
            category,
            order: order || 0,
        });
        res.status(201).send({ success: true, message: "Banner added successfully", banner });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in adding banner", error });
    }
};

export const toggleBanner = async (req, res) => {
    try {
        const banner = await bannerModel.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
        if (!banner) return res.status(404).send({ success: false, message: "Banner not found" });
        res.status(200).send({ success: true, message: "Banner updated successfully", banner });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in toggling banner", error });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const banner = await bannerModel.findById(req.params.id);
        if (!banner) return res.status(404).send({ success: false, message: "Banner not found" });
        await cloudinaryV2.uploader.destroy(banner.image.public_id);
        await bannerModel.findByIdAndDelete(req.params.id);
        res.status(200).send({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in deleting banner", error });
    }
};

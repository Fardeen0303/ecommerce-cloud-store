import userModel from "../models/userModel.js";

export const getWishlistItems = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        res.status(201).send({ success: true, wishlistItems: user.wishlist });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in getting Wishlist Products", error });
    }
};

export const updateWishlist = async (req, res) => {
    try {
        const { productId, type } = req.body;
        let response;
        if (type === "add") {
            response = await userModel.findByIdAndUpdate(req.user._id, { $push: { wishlist: productId } });
        } else if (type === "remove") {
            response = await userModel.findByIdAndUpdate(req.user._id, { $pull: { wishlist: productId } }, { new: true });
        }
        res.status(201).send({ success: true, wishlistItems: response.wishlist });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Updating Wishlist Products", error });
    }
};

export const getWishlistProducts = async (req, res) => {
    try {
        const { user } = req;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 5;
        const skip = (page - 1) * pageSize;

        const userWishlistCount = await userModel.findById(user._id).select("wishlist").lean();
        const totalItems = userWishlistCount?.wishlist?.length || 0;

        // Fetch wishlist product details from product-service
        const wishlistIds = userWishlistCount?.wishlist?.slice(skip, skip + pageSize) || [];

        const productRequests = wishlistIds.map((id) =>
            fetch(`${process.env.PRODUCT_SERVICE_URL}/api/v1/product/${id}`).then((r) => r.json())
        );
        const results = await Promise.all(productRequests);
        const wishlistItems = results.filter((r) => r.success).map((r) => r.product);

        res.status(200).json({ success: true, wishlistItems, totalItems, currentPage: page, pageSize });
    } catch (error) {
        res.status(500).json({ error: "Internal server error while fetching wishlist items" });
    }
};

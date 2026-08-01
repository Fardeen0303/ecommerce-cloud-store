import productModel from "../../models/productModel.js";

const addReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;
        const userId = req.user._id;
        const userName = req.user.name;

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found",
            });
        }

        // Check if user already reviewed
        const isReviewed = product.reviews.find(
            (review) => review.user.toString() === userId.toString()
        );

        if (isReviewed) {
            // Update existing review
            product.reviews.forEach((review) => {
                if (review.user.toString() === userId.toString()) {
                    review.rating = rating;
                    review.comment = comment;
                }
            });
        } else {
            // Add new review
            product.reviews.push({
                user: userId,
                name: userName,
                rating: Number(rating),
                comment,
            });
            product.numOfReviews = product.reviews.length;
        }

        // Calculate average rating
        let totalRating = 0;
        product.reviews.forEach((review) => {
            totalRating += review.rating;
        });
        product.ratings = totalRating / product.reviews.length;

        await product.save();

        res.status(201).send({
            success: true,
            message: "Review added successfully",
        });
    } catch (error) {
        console.log("Add Review Error: ", error);
        res.status(500).send({
            success: false,
            message: "Error in adding review",
            error: error.message,
        });
    }
};

export default addReview;

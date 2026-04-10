import bannerModel from "../../models/bannerModel.js";

const getBanners = async (req, res) => {
    try {
        const banners = await bannerModel
            .find({ isActive: true })
            .sort({ order: 1 });
        res.status(200).send({ success: true, banners });
    } catch (error) {
        console.log("Get Banners Error: " + error);
        res.status(500).send({
            success: false,
            message: "Error in getting banners",
            error,
        });
    }
};

export default getBanners;

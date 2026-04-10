import bannerModel from "../../models/bannerModel.js";

const getAllBanners = async (req, res) => {
    try {
        const banners = await bannerModel.find({}).sort({ order: 1 });
        res.status(200).send({ success: true, banners });
    } catch (error) {
        console.log("Get All Banners Error: " + error);
        res.status(500).send({
            success: false,
            message: "Error in getting all banners",
            error,
        });
    }
};

export default getAllBanners;

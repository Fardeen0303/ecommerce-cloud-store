import bannerModel from "../../models/bannerModel.js";
import { v2 as cloudinary } from "cloudinary";

const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await bannerModel.findById(id);
        if (!banner) {
            return res.status(404).send({
                success: false,
                message: "Banner not found",
            });
        }

        await cloudinary.uploader.destroy(banner.image.public_id);
        await bannerModel.findByIdAndDelete(id);

        res.status(200).send({
            success: true,
            message: "Banner deleted successfully",
        });
    } catch (error) {
        console.log("Delete Banner Error: " + error);
        res.status(500).send({
            success: false,
            message: "Error in deleting banner",
            error,
        });
    }
};

export default deleteBanner;

import bannerModel from "../../models/bannerModel.js";

const toggleBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const banner = await bannerModel.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!banner) {
            return res.status(404).send({
                success: false,
                message: "Banner not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Banner updated successfully",
            banner,
        });
    } catch (error) {
        console.log("Toggle Banner Error: " + error);
        res.status(500).send({
            success: false,
            message: "Error in toggling banner",
            error,
        });
    }
};

export default toggleBanner;

import bannerModel from "../../models/bannerModel.js";
import { v2 as cloudinary } from "cloudinary";

const addBanner = async (req, res) => {
    try {
        const { category, order } = req.body;
        const file = req.files?.image;

        if (!file || !category) {
            return res.status(400).send({
                success: false,
                message: "Image and category are required",
            });
        }

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "banners",
        });

        const banner = await bannerModel.create({
            image: {
                public_id: result.public_id,
                url: result.secure_url,
            },
            category,
            order: order || 0,
        });

        res.status(201).send({
            success: true,
            message: "Banner added successfully",
            banner,
        });
    } catch (error) {
        console.log("Add Banner Error: " + error);
        res.status(500).send({
            success: false,
            message: "Error in adding banner",
            error,
        });
    }
};

export default addBanner;

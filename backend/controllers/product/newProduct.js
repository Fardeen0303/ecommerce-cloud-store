import productModel from "../../models/productModel.js";
import cloudinary from "cloudinary";

const newProduct = async (req, res) => {
    try {
        console.log("Creating new product...");
        
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        const imagesLink = [];

        console.log("Uploading product images...");
        for (let i = 0; i < images?.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
                resource_type: "auto",
            });

            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        
        console.log("Uploading brand logo...");
        const result = await cloudinary.v2.uploader.upload(req.body.logo, {
            folder: "brands",
            resource_type: "auto",
        });
        const brandLogo = {
            public_id: result.public_id,
            url: result.secure_url,
        };

        req.body.brand = {
            name: req.body.brandName,
            logo: brandLogo,
        };
        req.body.images = imagesLink;
        req.body.seller = req.user._id;

        let specs = [];
        req.body.specifications.forEach((s) => {
            specs.push(JSON.parse(s));
        });
        req.body.specifications = specs;

        console.log("Saving product to database...");
        const product = await productModel.create(req.body);

        console.log("Product created successfully");
        res.status(201).send({
            success: true,
            product,
        });
    } catch (error) {
        console.log("New Product Error: ", error);
        res.status(500).send({
            success: false,
            message: "Error in adding New Product",
            error: error.message,
        });
    }
};

export default newProduct;

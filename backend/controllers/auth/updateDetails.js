import userModel from "../../models/userModel.js";
import jwt from "jsonwebtoken";

// Update Details controller
export const updateDetailsController = async (req, res) => {
    try {
        const { newName, newEmail, newPhone, email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "User Not Found!",
                errorType: "invalidUser",
            });
        }

        if (newName) user.name = newName;
        if (newEmail) user.email = newEmail;
        if (newPhone) user.phone = newPhone;

        await user.save();

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        return res.status(200).send({
            success: true,
            message: newName ? "Name Updated Successfully!" : newEmail ? "Email Updated Successfully!" : "Mobile Number Updated Successfully!",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.log("Update Details Error: " + error);
        res.status(500).send({
            success: false,
            message: "Error in Updating Details",
            error,
        });
    }
};

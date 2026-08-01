import { hashPassword, comparePassword } from "../helper/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
    try {
        const { name, email, phone, password, address, isSeller } = req.body;
        if (!name) return res.send({ message: "Name is Required" });
        if (!email) return res.send({ message: "Email is Required" });
        if (!password) return res.send({ message: "Password is Required" });
        if (!phone) return res.send({ message: "Phone No. is Required" });
        if (!address) return res.send({ message: "Address is Required" });

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({ success: false, message: "Email already registered!", errorType: "emailConflict" });
        }

        const hashedPassword = await hashPassword(password);
        const user = new userModel({ name, email, phone, password: hashedPassword, address, role: isSeller ? 1 : 0 });
        await user.save();

        res.status(201).send({ success: true, message: "User Registered Successfully!", user });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Registration", error });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).send({ success: false, message: "Invalid username or password", errorType: "invalidCredentials" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).send({ success: false, message: "User Not Registered!", errorType: "invalidUser" });
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).send({ success: false, message: "Invalid Password!", errorType: "invalidPassword" });
        }

        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).send({
            success: true,
            message: "Logged in Successfully!",
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role },
            token,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Login", error });
    }
};

export const userCheckController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(401).send({ success: false, message: "Invalid username", errorType: "invalidCredentials" });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).send({ success: false, message: "User Not Registered!", errorType: "invalidUser" });

        res.status(200).send({ success: true, message: "User Found!" });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in User Checking", error });
    }
};

export const forgotPasswordController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).send({ success: false, message: "Invalid username or password", errorType: "invalidCredentials" });
        }

        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).send({ success: false, message: "User Not Registered!", errorType: "invalidUser" });

        const newPassword = await hashPassword(password);
        const response = await userModel.findOneAndUpdate({ email }, { password: newPassword });

        res.status(200).send({ success: true, message: "Password Reset Successfully!", response });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Forgot Password", error });
    }
};

export const updateDetailsController = async (req, res) => {
    try {
        const { newName, newEmail, newPhone, email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).send({ success: false, message: "User Not Found!", errorType: "invalidUser" });

        if (newName) user.name = newName;
        if (newEmail) user.email = newEmail;
        if (newPhone) user.phone = newPhone;
        await user.save();

        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        return res.status(200).send({
            success: true,
            message: newName ? "Name Updated Successfully!" : newEmail ? "Email Updated Successfully!" : "Mobile Number Updated Successfully!",
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role },
            token,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Updating Details", error });
    }
};

export const deactivateController = async (req, res) => {
    try {
        const { email, phone } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).send({ success: false, message: "User Not Found!", errorType: "invalidUser" });

        phone === user.phone && (await userModel.deleteOne({ email }))
            ? res.status(200).send({ success: true, message: "Account Deleted Successfully!" })
            : res.status(401).send({ success: true, message: "Mobile Number does not match!", errorType: "phoneMismatch" });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Deactivating Account", error });
    }
};

// Internal route used by other services to fetch user by ID
export const getInternalUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Internal route: remove deleted product from all wishlists
export const removeWishlistProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        await userModel.updateMany({ wishlist: productId }, { $pull: { wishlist: productId } });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

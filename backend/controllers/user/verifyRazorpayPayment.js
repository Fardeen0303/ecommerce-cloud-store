import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import orderModel from "../../models/orderModel.js";
import mongoose from "mongoose";
import productModel from "../../models/productModel.js";
import { sendOrderNotification } from "../../helper/notificationHelper.js";
import userModel from "../../models/userModel.js";

const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderItems, shippingInfo } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).send({ success: false, message: "Payment verification failed" });
        }

        const totalAmount = orderItems.reduce(
            (sum, item) => sum + item.discountPrice * item.quantity,
            0
        );

        const orderObject = orderItems.map((product) => ({
            name: product.name,
            image: product.image,
            brandName: product.brandName,
            price: product.price,
            discountPrice: product.discountPrice,
            quantity: product.quantity,
            productId: new mongoose.Types.ObjectId(product.productId),
            seller: new mongoose.Types.ObjectId(product.seller),
        }));

        const order = new orderModel({
            paymentId: razorpay_payment_id,
            paymentMethod: "Razorpay",
            products: orderObject,
            buyer: req.user._id,
            shippingInfo: {
                ...shippingInfo,
                pincode: Number(shippingInfo.pincode),
                phoneNo: Number(shippingInfo.phoneNo),
            },
            amount: totalAmount,
            paymentVerified: true,
            orderStatus: "Processing",
        });

        await order.save();

        for (const item of orderItems) {
            const product = await productModel.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        const user = await userModel.findById(req.user._id);
        if (user) {
            const productList = orderItems.map((i) => `${i.name} x${i.quantity}`).join(", ");
            await sendOrderNotification({
                user,
                subject: "Order Placed - EliteMarket",
                emailHtml: `<h2>Order Placed Successfully!</h2><p>Hi ${user.name},</p><p>Your Razorpay payment was successful.</p><p><b>Items:</b> ${productList}</p><p><b>Total:</b> ₹${totalAmount}</p><p><b>Order ID:</b> ${order._id}</p>`,
                smsBody: `EliteMarket: Order placed! Order ID: ${order._id}. Items: ${productList}. Total: Rs.${totalAmount}. Payment: Razorpay.`,
            });
        }

        return res.status(200).send({ success: true, orderId: order._id });
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        return res.status(500).send({ success: false, message: "Error verifying payment" });
    }
};

export default verifyRazorpayPayment;

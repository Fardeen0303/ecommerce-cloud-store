import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import orderModel from "../../models/orderModel.js";
import mongoose from "mongoose";
import productModel from "../../models/productModel.js";
import { sendOrderNotification } from "../../helper/notificationHelper.js";
import userModel from "../../models/userModel.js";

const PAYPAL_API = "https://api-m.paypal.com"; // live endpoint

const getPayPalAccessToken = async () => {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
        `${PAYPAL_API}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );
    return response.data.access_token;
};

const capturePayPalOrder = async (req, res) => {
    try {
        const { paypalOrderId, orderItems, shippingInfo } = req.body;

        // Capture the payment
        const accessToken = await getPayPalAccessToken();
        const captureResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const captureData = captureResponse.data;

        if (captureData.status !== "COMPLETED") {
            return res.status(400).send({ success: false, message: "Payment not completed" });
        }

        const paymentId = captureData.purchase_units[0].payments.captures[0].id;
        const amountPaid = captureData.purchase_units[0].payments.captures[0].amount.value;

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
            paymentId,
            paymentMethod: "PayPal",
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
                emailHtml: `<h2>Order Placed Successfully!</h2><p>Hi ${user.name},</p><p>Your PayPal payment was successful.</p><p><b>Items:</b> ${productList}</p><p><b>Total:</b> ₹${totalAmount}</p><p><b>Order ID:</b> ${order._id}</p>`,
                smsBody: `EliteMarket: Order placed! Order ID: ${order._id}. Total: Rs.${totalAmount}. Payment: PayPal.`,
            });
        }

        return res.status(200).send({ success: true, orderId: order._id });
    } catch (error) {
        console.error("Error capturing PayPal payment:", error);
        return res.status(500).send({ success: false, message: "Error capturing payment" });
    }
};

export default capturePayPalOrder;

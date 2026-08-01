import orderModel from "../../models/orderModel.js";
import mongoose from "mongoose";
import productModel from "../../models/productModel.js";
import { sendOrderNotification } from "../../helper/notificationHelper.js";
import userModel from "../../models/userModel.js";

const createCODOrder = async (req, res) => {
    try {
        const { orderItems, shippingInfo } = req.body;

        if (!orderItems?.length) {
            return res.status(400).send({ success: false, message: "No order items provided" });
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

        const combinedOrder = {
            paymentId: `COD_${Date.now()}`,
            paymentMethod: "COD",
            products: orderObject,
            buyer: req.user._id,
            shippingInfo: {
                ...shippingInfo,
                pincode: Number(shippingInfo.pincode),
                phoneNo: Number(shippingInfo.phoneNo),
            },
            amount: totalAmount,
            paymentVerified: true,
        };

        const order = new orderModel(combinedOrder);
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
                emailHtml: `<h2>Order Placed Successfully!</h2><p>Hi ${user.name},</p><p>Your COD order has been placed.</p><p><b>Items:</b> ${productList}</p><p><b>Total:</b> ₹${totalAmount}</p><p><b>Order ID:</b> ${order._id}</p>`,
                smsBody: `EliteMarket: Order placed! Order ID: ${order._id}. Items: ${productList}. Total: Rs.${totalAmount}. Payment: Cash on Delivery.`,
            });
        }

        return res.status(200).send({ success: true, orderId: order._id });
    } catch (error) {
        console.error("Error creating COD order:", error);
        return res.status(500).send({ success: false, message: "Error creating order" });
    }
};

export default createCODOrder;

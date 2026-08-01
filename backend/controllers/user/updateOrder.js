import orderModel from "../../models/orderModel.js";
import mongoose from "mongoose";
import { sendOrderNotification } from "../../helper/notificationHelper.js";
import userModel from "../../models/userModel.js";

const updateOrder = async (req, res) => {
    try {
        const { status, orderId, itemId } = req.body;
        console.log("updateOrder called:", { status, orderId, itemId });

        if (itemId) {
            const order = await orderModel.findById(orderId);
            if (!order) {
                return res.status(404).send({ success: false, message: "Order not found" });
            }

            const item = order.products.find(
                (p) => p._id.toString() === itemId.toString()
            );
            if (!item) {
                console.log("Item not found. Available IDs:", order.products.map(p => p._id.toString()));
                return res.status(404).send({ success: false, message: "Item not found" });
            }

            item.itemStatus = status;

            const allStatuses = order.products.map((p) => p.itemStatus || "Processing");
            if (allStatuses.every((s) => s === "Delivered")) order.orderStatus = "Delivered";
            else if (allStatuses.some((s) => s === "Out For Delivery")) order.orderStatus = "Out For Delivery";
            else if (allStatuses.some((s) => s === "Shipped")) order.orderStatus = "Shipped";

            await order.save();

            const user = await userModel.findById(order.buyer);
            if (user) {
                await sendOrderNotification({
                    user,
                    subject: `Order Update: ${item.name} is now ${status} - EliteMarket`,
                    emailHtml: `<h2>Order Status Update</h2><p>Hi ${user.name},</p><p>Your item <b>${item.name}</b> in Order ID <b>${order._id}</b> is now <b>${status}</b>.</p><p><b>Overall Order Status:</b> ${order.orderStatus}</p>`,
                    smsBody: `EliteMarket: ${item.name} is now ${status}. Order ID: ${order._id}. Overall status: ${order.orderStatus}.`,
                });
            }

            return res.status(200).send({ success: true });
        } else {
            const updatedOrder = await orderModel.findByIdAndUpdate(
                orderId,
                { orderStatus: status },
                { new: true }
            );
            if (updatedOrder) {
                const user = await userModel.findById(updatedOrder.buyer);
                if (user) {
                    await sendOrderNotification({
                        user,
                        subject: `Order Status Updated: ${status} - EliteMarket`,
                        emailHtml: `<h2>Order Status Updated</h2><p>Hi ${user.name},</p><p>Your Order ID <b>${orderId}</b> status has been updated to <b>${status}</b>.</p>`,
                        smsBody: `EliteMarket: Your order ${orderId} status updated to ${status}.`,
                    });
                }
                return res.status(200).send({ success: true });
            }
        }
    } catch (error) {
        console.error("Error in updating Order Details:", error);
        res.status(500).send("Error in updating order details");
    }
};

export default updateOrder;

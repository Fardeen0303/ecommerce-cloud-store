import orderModel from "../../models/orderModel.js";
import { sendOrderNotification } from "../../helper/notificationHelper.js";
import userModel from "../../models/userModel.js";

const verifyPayment = async (req, res) => {
    try {
        const { orderId, verified } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).send({ success: false, message: "Order not found" });
        }

        order.paymentVerified = verified;
        order.orderStatus = verified ? "Processing" : "Payment Failed";
        await order.save();

        const user = await userModel.findById(order.buyer);
        if (user) {
            const status = verified ? "verified" : "failed";
            await sendOrderNotification({
                user,
                subject: `Payment ${verified ? "Verified" : "Failed"} - EliteMarket`,
                emailHtml: `<h2>Payment ${verified ? "Verified ✅" : "Failed ❌"}</h2><p>Hi ${user.name},</p><p>Your payment for Order ID <b>${order._id}</b> has been <b>${status}</b>.</p><p><b>Amount:</b> ₹${order.amount}</p>${verified ? "<p>Your order is now being processed.</p>" : "<p>Please contact support if you believe this is an error.</p>"}`,
                smsBody: `EliteMarket: Payment ${status} for Order ID: ${order._id}. Amount: Rs.${order.amount}. ${verified ? "Your order is now processing." : "Contact support for help."}`,
            });
        }

        return res.status(200).send({
            success: true,
            message: verified ? "Payment verified successfully" : "Payment marked as failed",
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).send({ success: false, message: "Error verifying payment" });
    }
};

export default verifyPayment;

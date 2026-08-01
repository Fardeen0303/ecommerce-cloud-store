import orderModel from "../../models/orderModel.js";
import productModel from "../../models/productModel.js";

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).send({ success: false, message: "Order not found" });
        }

        // Check if user owns the order or is admin
        if (order.buyer.toString() !== userId.toString() && req.user.role !== 1) {
            return res.status(403).send({ success: false, message: "Unauthorized" });
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).send({ success: false, message: "Cannot cancel delivered order" });
        }

        if (order.orderStatus === "Cancelled") {
            return res.status(400).send({ success: false, message: "Order already cancelled" });
        }

        // Restore product stock
        for (const item of order.products) {
            const product = await productModel.findById(item.productId);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.orderStatus = "Cancelled";
        await order.save();

        return res.status(200).send({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling order:", error);
        return res.status(500).send({ success: false, message: error.message || "Error cancelling order" });
    }
};

export default cancelOrder;

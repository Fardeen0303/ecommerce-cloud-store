import orderModel from "../models/orderModel.js";
import mongoose from "mongoose";
import { sendOrderNotification } from "../helper/notificationHelper.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";
import stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const PAYPAL_API = "https://api-m.paypal.com";

// ─── Helpers ──────────────────────────────────────────────────────────────

const getPayPalAccessToken = async () => {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data.access_token;
};

const reduceStock = async (items) => {
    await fetch(`${process.env.PRODUCT_SERVICE_URL}/api/v1/product/internal/reduce-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
    });
};

const restoreStock = async (items) => {
    await fetch(`${process.env.PRODUCT_SERVICE_URL}/api/v1/product/internal/restore-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
    });
};

const buildOrderObject = (orderItems) =>
    orderItems.map((product) => ({
        name: product.name,
        image: product.image,
        brandName: product.brandName,
        price: product.price,
        discountPrice: product.discountPrice,
        quantity: product.quantity,
        productId: new mongoose.Types.ObjectId(product.productId),
        seller: new mongoose.Types.ObjectId(product.seller),
    }));

// ─── COD ──────────────────────────────────────────────────────────────────

export const createCODOrder = async (req, res) => {
    try {
        const { orderItems, shippingInfo } = req.body;
        if (!orderItems?.length) return res.status(400).send({ success: false, message: "No order items provided" });

        const totalAmount = orderItems.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);

        const order = new orderModel({
            paymentId: `COD_${Date.now()}`,
            paymentMethod: "COD",
            products: buildOrderObject(orderItems),
            buyer: req.user._id,
            shippingInfo: { ...shippingInfo, pincode: Number(shippingInfo.pincode), phoneNo: Number(shippingInfo.phoneNo) },
            amount: totalAmount,
            paymentVerified: true,
        });
        await order.save();

        await reduceStock(orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })));

        const productList = orderItems.map((i) => `${i.name} x${i.quantity}`).join(", ");
        await sendOrderNotification({
            user: req.user,
            subject: "Order Placed - EliteMarket",
            emailHtml: `<h2>Order Placed Successfully!</h2><p>Hi ${req.user.name},</p><p>Your COD order has been placed.</p><p><b>Items:</b> ${productList}</p><p><b>Total:</b> ₹${totalAmount}</p><p><b>Order ID:</b> ${order._id}</p>`,
            smsBody: `EliteMarket: Order placed! Order ID: ${order._id}. Items: ${productList}. Total: Rs.${totalAmount}. Payment: Cash on Delivery.`,
        });

        return res.status(200).send({ success: true, orderId: order._id });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Error creating order" });
    }
};

// ─── PayPal ───────────────────────────────────────────────────────────────

export const createPayPalOrder = async (req, res) => {
    try {
        const { products, frontendURL } = req.body;
        const totalAmount = products.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);
        const accessToken = await getPayPalAccessToken();

        const orderResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders`,
            {
                intent: "CAPTURE",
                purchase_units: [{ amount: { currency_code: "USD", value: (totalAmount / 83).toFixed(2) }, description: "EliteMarket Order" }],
                application_context: { return_url: `${frontendURL}/shipping/confirm`, cancel_url: `${frontendURL}/shipping/failed` },
            },
            { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
        );

        res.status(200).send({ success: true, orderId: orderResponse.data.id });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error creating PayPal order" });
    }
};

export const capturePayPalOrder = async (req, res) => {
    try {
        const { paypalOrderId, orderItems, shippingInfo } = req.body;
        const accessToken = await getPayPalAccessToken();

        const captureResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`,
            {},
            { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
        );

        const captureData = captureResponse.data;
        if (captureData.status !== "COMPLETED") return res.status(400).send({ success: false, message: "Payment not completed" });

        const paymentId = captureData.purchase_units[0].payments.captures[0].id;
        const totalAmount = orderItems.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);

        const order = new orderModel({
            paymentId,
            paymentMethod: "PayPal",
            products: buildOrderObject(orderItems),
            buyer: req.user._id,
            shippingInfo: { ...shippingInfo, pincode: Number(shippingInfo.pincode), phoneNo: Number(shippingInfo.phoneNo) },
            amount: totalAmount,
            paymentVerified: true,
            orderStatus: "Processing",
        });
        await order.save();

        await reduceStock(orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })));

        const productList = orderItems.map((i) => `${i.name} x${i.quantity}`).join(", ");
        await sendOrderNotification({
            user: req.user,
            subject: "Order Placed - EliteMarket",
            emailHtml: `<h2>Order Placed Successfully!</h2><p>Hi ${req.user.name},</p><p>Your PayPal payment was successful.</p><p><b>Items:</b> ${productList}</p><p><b>Total:</b> ₹${totalAmount}</p><p><b>Order ID:</b> ${order._id}</p>`,
            smsBody: `EliteMarket: Order placed! Order ID: ${order._id}. Total: Rs.${totalAmount}. Payment: PayPal.`,
        });

        return res.status(200).send({ success: true, orderId: order._id });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Error capturing payment" });
    }
};

// ─── Razorpay ─────────────────────────────────────────────────────────────

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
    try {
        const { products } = req.body;
        const totalAmount = products.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);
        const order = await razorpayInstance.orders.create({ amount: totalAmount * 100, currency: "INR", receipt: `receipt_${Date.now()}` });
        res.status(200).send({ success: true, order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error creating payment order" });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderItems, shippingInfo } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature)
            return res.status(400).send({ success: false, message: "Payment verification failed" });

        const totalAmount = orderItems.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);

        const order = new orderModel({
            paymentId: razorpay_payment_id,
            paymentMethod: "Razorpay",
            products: buildOrderObject(orderItems),
            buyer: req.user._id,
            shippingInfo: { ...shippingInfo, pincode: Number(shippingInfo.pincode), phoneNo: Number(shippingInfo.phoneNo) },
            amount: totalAmount,
            paymentVerified: true,
            orderStatus: "Processing",
        });
        await order.save();

        await reduceStock(orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })));

        const productList = orderItems.map((i) => `${i.name} x${i.quantity}`).join(", ");
        await sendOrderNotification({
            user: req.user,
            subject: "Order Placed - EliteMarket",
            emailHtml: `<h2>Order Placed Successfully!</h2><p>Hi ${req.user.name},</p><p>Your Razorpay payment was successful.</p><p><b>Items:</b> ${productList}</p><p><b>Total:</b> ₹${totalAmount}</p><p><b>Order ID:</b> ${order._id}</p>`,
            smsBody: `EliteMarket: Order placed! Order ID: ${order._id}. Items: ${productList}. Total: Rs.${totalAmount}. Payment: Razorpay.`,
        });

        return res.status(200).send({ success: true, orderId: order._id });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Error verifying payment" });
    }
};

// ─── Stripe ───────────────────────────────────────────────────────────────

export const createSession = async (req, res) => {
    try {
        const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
        const { products, frontendURL, customerEmail } = req.body;

        const lineItems = products?.map((item) => ({
            price_data: { currency: "inr", unit_amount: item.discountPrice * 100, product_data: { name: item?.name } },
            quantity: item.quantity,
        }));

        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ["card"],
            currency: "inr",
            line_items: lineItems,
            mode: "payment",
            success_url: `${frontendURL}/shipping/confirm`,
            cancel_url: `${frontendURL}/shipping/failed`,
            customer_email: customerEmail,
            shipping_address_collection: { allowed_countries: ["IN"] },
            phone_number_collection: { enabled: true },
        });

        res.send({ session });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error in Payment Gateway", error });
    }
};

// ─── Order Management ─────────────────────────────────────────────────────

export const getOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ buyer: req.user._id, orderStatus: { $ne: "Cancelled" } });
        res.status(200).send({ success: true, orders });
    } catch (error) {
        res.status(500).send("Error in getting orders");
    }
};

export const getOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.query;
        const orderDetails = await orderModel.find({ _id: orderId });
        res.status(200).send({ success: true, orderDetails });
    } catch (error) {
        res.status(500).send("Error in getting order details");
    }
};

export const getAdminOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ "products.seller": req.user._id, orderStatus: { $ne: "Cancelled" } });
        res.status(200).send({ success: true, orders });
    } catch (error) {
        res.status(500).send("Error in getting orders");
    }
};

export const getAllUserOrder = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.status(200).send({ success: true, orders });
    } catch (error) {
        res.status(500).send("Error in getting all user orders");
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) return res.status(404).send({ success: false, message: "Order not found" });

        if (order.buyer.toString() !== req.user._id.toString() && req.user.role !== 1)
            return res.status(403).send({ success: false, message: "Unauthorized" });
        if (order.orderStatus === "Delivered")
            return res.status(400).send({ success: false, message: "Cannot cancel delivered order" });
        if (order.orderStatus === "Cancelled")
            return res.status(400).send({ success: false, message: "Order already cancelled" });

        await restoreStock(order.products.map((item) => ({ productId: item.productId, quantity: item.quantity })));

        order.orderStatus = "Cancelled";
        await order.save();

        return res.status(200).send({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message || "Error cancelling order" });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { status, orderId, itemId } = req.body;

        if (itemId) {
            const order = await orderModel.findById(orderId);
            if (!order) return res.status(404).send({ success: false, message: "Order not found" });

            const item = order.products.find((p) => p._id.toString() === itemId.toString());
            if (!item) return res.status(404).send({ success: false, message: "Item not found" });

            item.itemStatus = status;

            const allStatuses = order.products.map((p) => p.itemStatus || "Processing");
            if (allStatuses.every((s) => s === "Delivered")) order.orderStatus = "Delivered";
            else if (allStatuses.some((s) => s === "Out For Delivery")) order.orderStatus = "Out For Delivery";
            else if (allStatuses.some((s) => s === "Shipped")) order.orderStatus = "Shipped";

            await order.save();

            // Fetch user from auth-service for notification
            const userRes = await fetch(`${process.env.AUTH_SERVICE_URL}/api/v1/auth/internal/user/${order.buyer}`);
            const userData = await userRes.json();
            if (userData.success) {
                await sendOrderNotification({
                    user: userData.user,
                    subject: `Order Update: ${item.name} is now ${status} - EliteMarket`,
                    emailHtml: `<h2>Order Status Update</h2><p>Hi ${userData.user.name},</p><p>Your item <b>${item.name}</b> in Order ID <b>${order._id}</b> is now <b>${status}</b>.</p>`,
                    smsBody: `EliteMarket: ${item.name} is now ${status}. Order ID: ${order._id}.`,
                });
            }

            return res.status(200).send({ success: true });
        } else {
            const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
            if (updatedOrder) {
                const userRes = await fetch(`${process.env.AUTH_SERVICE_URL}/api/v1/auth/internal/user/${updatedOrder.buyer}`);
                const userData = await userRes.json();
                if (userData.success) {
                    await sendOrderNotification({
                        user: userData.user,
                        subject: `Order Status Updated: ${status} - EliteMarket`,
                        emailHtml: `<h2>Order Status Updated</h2><p>Hi ${userData.user.name},</p><p>Your Order ID <b>${orderId}</b> status has been updated to <b>${status}</b>.</p>`,
                        smsBody: `EliteMarket: Your order ${orderId} status updated to ${status}.`,
                    });
                }
                return res.status(200).send({ success: true });
            }
        }
    } catch (error) {
        res.status(500).send("Error in updating order details");
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { orderId, verified } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) return res.status(404).send({ success: false, message: "Order not found" });

        order.paymentVerified = verified;
        order.orderStatus = verified ? "Processing" : "Payment Failed";
        await order.save();

        const userRes = await fetch(`${process.env.AUTH_SERVICE_URL}/api/v1/auth/internal/user/${order.buyer}`);
        const userData = await userRes.json();
        if (userData.success) {
            const status = verified ? "verified" : "failed";
            await sendOrderNotification({
                user: userData.user,
                subject: `Payment ${verified ? "Verified" : "Failed"} - EliteMarket`,
                emailHtml: `<h2>Payment ${verified ? "Verified ✅" : "Failed ❌"}</h2><p>Hi ${userData.user.name},</p><p>Your payment for Order ID <b>${order._id}</b> has been <b>${status}</b>.</p><p><b>Amount:</b> ₹${order.amount}</p>`,
                smsBody: `EliteMarket: Payment ${status} for Order ID: ${order._id}. Amount: Rs.${order.amount}.`,
            });
        }

        return res.status(200).send({ success: true, message: verified ? "Payment verified successfully" : "Payment marked as failed" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Error verifying payment" });
    }
};

export const deleteAllOrders = async (req, res) => {
    try {
        await orderModel.deleteMany({});
        res.status(200).send({ success: true, message: "All orders cleared" });
    } catch (error) {
        res.status(500).send("Error clearing orders");
    }
};

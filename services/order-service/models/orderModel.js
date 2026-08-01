import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    paymentId: { type: String, required: true },
    paymentMethod: { type: String, enum: ["PayPal", "COD", "UPI", "Razorpay"], default: "PayPal" },
    products: [
        {
            name: { type: String },
            image: { type: String },
            brandName: { type: String },
            price: { type: Number },
            discountPrice: { type: Number },
            quantity: { type: Number, default: 1 },
            productId: { type: String, required: true },
            seller: { type: mongoose.Schema.ObjectId },
            itemStatus: { type: String, default: "Processing" },
        },
    ],
    buyer: { type: mongoose.Schema.ObjectId, required: true },
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        pincode: { type: Number, required: true },
        phoneNo: { type: Number, required: true },
        landmark: { type: String },
    },
    orderStatus: { type: String, default: "Processing" },
    paymentVerified: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    deliveredAt: Date,
    shippedAt: Date,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Orders", orderSchema);

import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (req, res) => {
    try {
        const { products } = req.body;

        const totalAmount = products.reduce(
            (sum, item) => sum + item.discountPrice * item.quantity,
            0
        );

        const order = await razorpayInstance.orders.create({
            amount: totalAmount * 100, // paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        res.status(200).send({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send({ success: false, message: "Error creating payment order" });
    }
};

export default createRazorpayOrder;

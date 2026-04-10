import orderModel from "../../models/orderModel.js";

const deleteAllOrders = async (req, res) => {
    try {
        await orderModel.deleteMany({});
        res.status(200).send({ success: true, message: "All orders cleared" });
    } catch (error) {
        console.error("Error deleting orders:", error);
        res.status(500).send("Error clearing orders");
    }
};

export default deleteAllOrders;

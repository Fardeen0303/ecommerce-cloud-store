import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

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

const createPayPalOrder = async (req, res) => {
    try {
        const { products, frontendURL } = req.body;

        const totalAmount = products.reduce(
            (sum, item) => sum + item.discountPrice * item.quantity,
            0
        );

        const accessToken = await getPayPalAccessToken();

        const orderResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders`,
            {
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: (totalAmount / 83).toFixed(2), // INR to USD
                        },
                        description: "EliteMarket Order",
                    },
                ],
                application_context: {
                    return_url: `${frontendURL}/shipping/confirm`,
                    cancel_url: `${frontendURL}/shipping/failed`,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).send({
            success: true,
            orderId: orderResponse.data.id,
        });
    } catch (error) {
        console.error("Error creating PayPal order:", error);
        res.status(500).send({
            success: false,
            message: "Error creating PayPal order",
        });
    }
};

export default createPayPalOrder;

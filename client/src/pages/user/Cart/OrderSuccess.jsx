import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useCart } from "../../../context/cart";
import { useAuth } from "../../../context/auth";
import axios from "axios";
import Spinner from "../../../components/Spinner";
import SeoData from "../../../SEO/SeoData";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [time, setTime] = useState(3);
    const [loading, setLoading] = useState(false);
    const [cartItems, setCartItems] = useCart();
    const { auth } = useAuth();
    const hasCaptured = useRef(false);

    useEffect(() => {
        const paypalToken = searchParams.get("token"); // PayPal returns ?token=ORDER_ID
        const shippingInfo = JSON.parse(localStorage.getItem("paypalShippingInfo"));

        if (paypalToken && shippingInfo && !hasCaptured.current) {
            hasCaptured.current = true;
            const capturePayment = async () => {
                try {
                    setLoading(true);
                    const res = await axios.post(
                        `${import.meta.env.VITE_SERVER_URL}/api/v1/user/capture-paypal-order`,
                        {
                            paypalOrderId: paypalToken,
                            orderItems: cartItems,
                            shippingInfo,
                        },
                        { headers: { Authorization: auth?.token } }
                    );
                    if (res.data.success) {
                        localStorage.removeItem("cart");
                        localStorage.removeItem("paypalShippingInfo");
                        setCartItems([]);
                    }
                } catch (error) {
                    console.error("PayPal capture error:", error);
                } finally {
                    setLoading(false);
                }
            };
            capturePayment();
        }
    }, [searchParams, auth?.token]);

    // Timer to redirect after 3 sec
    let intervalId = useRef(null);
    useEffect(() => {
        if (loading) return;
        intervalId.current = setInterval(() => {
            setTime((prev) => {
                let temp = prev - 1;
                if (temp === 0) {
                    clearInterval(intervalId.current);
                    navigate("/user/orders");
                }
                return temp;
            });
        }, 1000);
        return () => clearInterval(intervalId.current);
    }, [loading, navigate]);

    return (
        <>
            <SeoData title={`Transaction Successful`} />
            <main className="w-full p-8 relative min-h-[60vh]">
                {loading ? (
                    <Spinner />
                ) : (
                    <div className="flex flex-col gap-2 items-center justify-center sm:w-4/6 m-auto bg-white shadow rounded p-6 min-h-[60vh]">
                        <div className="flex gap-4 items-center">
                            <h1 className="text-2xl font-semibold">
                                Transaction Successful
                            </h1>
                            <CheckCircleOutlineIcon className="text-primaryPurple" />
                        </div>
                        <p className="mt-4 text-lg text-gray-800">
                            Redirecting to orders in {time} sec
                        </p>
                        <Link
                            to="/user/orders"
                            className="bg-primaryPurple mt-2 py-2.5 px-6 text-white uppercase shadow hover:shadow-lg rounded-sm"
                        >
                            go to orders
                        </Link>
                    </div>
                )}
            </main>
        </>
    );
};

export default OrderSuccess;

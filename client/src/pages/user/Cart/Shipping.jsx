import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { useState } from "react";
import states from "../../../utils/states";
import { toast } from "react-toastify";
import { useCart } from "../../../context/cart";
import { useAuth } from "../../../context/auth";
import axios from "axios";
import SeoData from "../../../SEO/SeoData";
import PriceCard from "./PriceCard";
import { useNavigate } from "react-router-dom";

const Shipping = () => {
    const Info = localStorage.getItem("shippingInfo");
    const shippingInfo = JSON.parse(Info);

    const [cartItems, setCartItems] = useCart();
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState(shippingInfo?.address);
    const [city, setCity] = useState(shippingInfo?.city);
    const [country, setCountry] = useState("IN");
    const [state, setState] = useState(shippingInfo?.state);
    const [landmark, setLandmark] = useState(shippingInfo?.landmark);
    const [pincode, setPincode] = useState(shippingInfo?.pincode);
    const [phoneNo, setPhoneNo] = useState(shippingInfo?.phoneNo);
    const [paymentMethod, setPaymentMethod] = useState("razorpay");

    const shippingSubmit = (e) => {
        e.preventDefault();

        if (String(phoneNo).length < 10 || String(phoneNo).length > 10) {
            toast.error("Invalid Mobile Number");
            return;
        }
        const data = {
            address: address,
            city: city,
            country: country,
            state: state,
            landmark: landmark,
            pincode: pincode,
            phoneNo: phoneNo,
        };
        localStorage.setItem("shippingInfo", JSON.stringify(data));
        
        if (paymentMethod === "cod") {
            handleCODOrder(data);
        } else if (paymentMethod === "razorpay") {
            handleRazorpayPayment(data);
        } else if (paymentMethod === "paypal") {
            handlePayPalPayment(data);
        }
    };

    //PAYPAL PAYMENT
    const handlePayPalPayment = async (shippingData) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/user/create-paypal-order`,
                {
                    products: cartItems,
                    frontendURL: window.location.origin,
                },
                { headers: { Authorization: auth?.token } }
            );
            // Save shippingInfo for use on return
            localStorage.setItem("paypalShippingInfo", JSON.stringify(shippingData));
            window.location.href = `https://www.paypal.com/checkoutnow?token=${response.data.orderId}`;
        } catch (error) {
            console.error("PayPal error:", error);
            toast.error("Error initiating PayPal payment");
        }
    };

    //RAZORPAY PAYMENT
    const handleRazorpayPayment = async (shippingData) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/user/create-razorpay-order`,
                { products: cartItems },
                { headers: { Authorization: auth?.token } }
            );

            const { order, key_id } = response.data;

            const options = {
                key: key_id,
                amount: order.amount,
                currency: "INR",
                name: "EliteMarket",
                description: "Order Payment",
                order_id: order.id,
                handler: async (paymentResponse) => {
                    try {
                        const verifyRes = await axios.post(
                            `${import.meta.env.VITE_SERVER_URL}/api/v1/user/verify-razorpay-payment`,
                            {
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                                orderItems: cartItems,
                                shippingInfo: shippingData,
                            },
                            { headers: { Authorization: auth?.token } }
                        );
                        if (verifyRes.data.success) {
                            toast.success("Order placed successfully!");
                            localStorage.removeItem("cart");
                            setCartItems([]);
                            navigate("/shipping/confirm");
                        }
                    } catch (error) {
                        toast.error("Payment verification failed");
                    }
                },
                prefill: { email: auth?.user?.email },
                theme: { color: "#f97316" },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", () => toast.error("Payment failed"));
            rzp.open();
        } catch (error) {
            console.error("Razorpay error:", error);
            toast.error("Error initiating payment");
        }
    };

    //CASH ON DELIVERY
    const handleCODOrder = async (shippingData) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/user/create-cod-order`,
                {
                    orderItems: cartItems,
                    shippingInfo: shippingData,
                },
                {
                    headers: {
                        Authorization: auth?.token,
                    },
                }
            );

            if (response.data.success) {
                toast.success("Order placed successfully!");
                localStorage.removeItem("cart");
                setCartItems([]);
                navigate("/shipping/confirm");
            }
        } catch (error) {
            console.error("COD order error:", error);
            toast.error("Error placing order");
        }
    };

    return (
        <>
            <SeoData title="Flipkart: Shipping Details" />
            <main className="w-full pt-8">
                {/* <!-- row --> */}

                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mx-0 px-2 sm:mx-8 mt-4 overflow-hidden">
                    {/* <!-- cart column --> */}
                    <div className="flex-1">
                        {/* <Stepper activeStep={1}> */}
                        <div className="w-full px-4 sm:px-0 bg-white py-5">
                            <form
                                onSubmit={shippingSubmit}
                                autoComplete="off"
                                className="flex flex-col justify-start gap-3 w-full sm:w-3/4 mx-1 sm:mx-8 my-4"
                            >
                                <TextField
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    fullWidth
                                    label="Address"
                                    variant="outlined"
                                    required
                                />

                                <div className="flex gap-6">
                                    <TextField
                                        value={pincode}
                                        onChange={(e) =>
                                            setPincode(e.target.value)
                                        }
                                        type="number"
                                        label="Pincode"
                                        fullWidth
                                        variant="outlined"
                                        required
                                    />
                                    <TextField
                                        value={phoneNo}
                                        onChange={(e) =>
                                            setPhoneNo(e.target.value)
                                        }
                                        type="number"
                                        label="Phone No"
                                        fullWidth
                                        variant="outlined"
                                        required
                                    />
                                </div>

                                <div className="flex gap-6">
                                    <TextField
                                        value={city}
                                        onChange={(e) =>
                                            setCity(e.target.value)
                                        }
                                        label="City"
                                        fullWidth
                                        variant="outlined"
                                        required
                                    />
                                    <TextField
                                        label="Landmark (Optional)"
                                        value={landmark}
                                        onChange={(e) =>
                                            setLandmark(e.target.value)
                                        }
                                        fullWidth
                                        variant="outlined"
                                    />
                                </div>

                                <div className="flex gap-6">
                                    <FormControl fullWidth>
                                        <InputLabel id="country-select">
                                            Country
                                        </InputLabel>
                                        <Select
                                            labelId="country-select"
                                            id="country-select"
                                            defaultValue={country}
                                            disabled
                                            label="Country"
                                            // onChange={(e) => setCountry(e.target.value)}
                                        >
                                            <MenuItem value={"IN"}>
                                                India
                                            </MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl
                                        fullWidth
                                        disabled={country ? false : true}
                                    >
                                        <InputLabel id="state-select">
                                            State
                                        </InputLabel>
                                        <Select
                                            labelId="state-select"
                                            id="state-select"
                                            value={state}
                                            label="State"
                                            onChange={(e) =>
                                                setState(e.target.value)
                                            }
                                            required
                                        >
                                            {states?.map((item) => (
                                                <MenuItem
                                                    key={item.code}
                                                    value={item.code}
                                                >
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>

                                <FormControl component="fieldset" className="mt-4">
                                    <FormLabel component="legend">Payment Method</FormLabel>
                                    <RadioGroup
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <FormControlLabel
                                            value="paypal"
                                            control={<Radio />}
                                            label="PayPal"
                                        />
                                        <FormControlLabel
                                            value="razorpay"
                                            control={<Radio />}
                                            label="Razorpay"
                                        />
                                        <FormControlLabel
                                            value="cod"
                                            control={<Radio />}
                                            label="Cash on Delivery (COD)"
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-orange-500 to-pink-500 w-full sm:w-[40%] mt-4 py-3.5 px-2 text-md font-[500] text-white shadow hover:shadow-lg rounded-sm uppercase outline-none"
                                >
                                    make payment
                                </button>
                            </form>
                        </div>
                        {/* </Stepper> */}
                    </div>

                    <PriceCard cartItems={cartItems} />
                </div>
            </main>
        </>
    );
};

export default Shipping;

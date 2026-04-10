import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Tracker from "./../user/Orders/Tracker";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../context/auth";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import SeoData from "../../SEO/SeoData";
import { toast } from "react-toastify";

const UpdateOrders = () => {
    const params = useParams();
    const orderId = params.id;

    const [loading, setLoading] = useState(false);
    const [UpdateOrders, setUpdateOrders] = useState([]);
    const [itemStatuses, setItemStatuses] = useState({});
    const { auth } = useAuth();
    const [reload, setReload] = useState(false);

    useEffect(() => {
        // fetch order detail from server
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_SERVER_URL
                    }/api/v1/user/admin-order-detail?orderId=${orderId}`,
                    {
                        headers: {
                            Authorization: auth?.token,
                        },
                    }
                );
                if (response?.data?.orderDetails) {
                    setUpdateOrders(...response.data.orderDetails);
                    setLoading(false);
                }
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };
        fetchOrders();
    }, [auth?.token, orderId, reload]);

    const amount = UpdateOrders?.amount;
    const orderItems = UpdateOrders?.products;
    const buyer = UpdateOrders?.buyer;
    const paymentId = UpdateOrders?.paymentId;
    const paymentMethod = UpdateOrders?.paymentMethod;
    const paymentVerified = UpdateOrders?.paymentVerified;
    const shippingInfo = UpdateOrders?.shippingInfo;
    const createdAt = UpdateOrders?.createdAt;
    const orderStatus = UpdateOrders?.orderStatus;

    const updateOrderSubmitHandler = async (e, itemId) => {
        try {
            e.preventDefault();
            const status = itemStatuses[itemId] || "";
            if (!status) {
                toast.error("Please select a status");
                return;
            }
            const res = await axios.patch(
                `${
                    import.meta.env.VITE_SERVER_URL
                }/api/v1/user/update/order-status`,
                { status, orderId, itemId: itemId.toString() },
                {
                    headers: { Authorization: auth?.token },
                }
            );
            if (res.status === 200) {
                toast.success("Item status updated!");
                setReload(!reload);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to update status");
        }
    };

    const verifyPaymentHandler = async (verified) => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/user/verify-payment`,
                { orderId, verified },
                { headers: { Authorization: auth?.token } }
            );
            if (res.status === 200) {
                setReload(!reload);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancelOrder = async () => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                const res = await axios.patch(
                    `${import.meta.env.VITE_SERVER_URL}/api/v1/user/cancel-order`,
                    { orderId },
                    { headers: { Authorization: auth?.token } }
                );
                if (res.data.success) {
                    toast.success("Order cancelled successfully");
                    setReload(!reload);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Error cancelling order");
            }
        }
    };

    return (
        <>
            <SeoData title="Order Details | EliteMarket" />

            <main className="w-full py-2 sm:py-8">
                {loading ? (
                    <Spinner />
                ) : (
                    <>
                        <div className="flex flex-col gap-4 max-w-6xl mx-auto">
                            <div className="flex flex-col sm:flex-row bg-white shadow rounded-sm min-w-full">
                                <div className="sm:w-1/2 border-r">
                                    <div className="flex flex-col gap-3 my-8 mx-10">
                                        <h3 className=" text-md font-[600]">
                                            Delivery Address
                                        </h3>
                                        <h4 className="font-medium">
                                            {buyer?.name}
                                        </h4>
                                        <p className="text-sm">{`${shippingInfo?.address}, ${shippingInfo?.city}, ${shippingInfo?.state} - ${shippingInfo?.pincode}`}</p>
                                        <div className="flex gap-2 text-sm">
                                            <p className="font-medium">Email</p>
                                            <p>{buyer?.email}</p>
                                        </div>
                                        <div className="flex gap-2 text-sm">
                                            <p className="font-medium">
                                                Phone Number
                                            </p>
                                            <p>{shippingInfo?.phoneNo}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full sm:w-1/2">
                                    <div className="flex flex-col gap-5 my-8 mx-10">
                                        {orderStatus === "Cancelled" && (
                                            <div className="bg-red-50 border border-red-200 p-3 rounded">
                                                <p className="text-red-600 font-semibold">This order has been cancelled</p>
                                            </div>
                                        )}
                                        {paymentMethod === "GooglePay" && !paymentVerified && (
                                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                                                <h3 className="text-md font-semibold text-yellow-800 mb-2">Payment Verification Required</h3>
                                                <p className="text-sm mb-2">Transaction ID: <span className="font-medium">{paymentId}</span></p>
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => verifyPaymentHandler(true)}
                                                        className="bg-green-600 px-4 py-2 text-sm text-white rounded hover:bg-green-700"
                                                    >
                                                        Verify Payment
                                                    </button>
                                                    <button
                                                        onClick={() => verifyPaymentHandler(false)}
                                                        className="bg-red-600 px-4 py-2 text-sm text-white rounded hover:bg-red-700"
                                                    >
                                                        Reject Payment
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <h3 className=" text-md font-[600]">
                                                Order Status
                                            </h3>
                                            {orderStatus !== "Delivered" && orderStatus !== "Cancelled" && (
                                                <button
                                                    onClick={handleCancelOrder}
                                                    className="bg-red-600 px-3 py-1.5 text-xs text-white rounded hover:bg-red-700"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                            <Link
                                                to="/admin/orders"
                                                className="ml-1 flex items-center gap-0 font-medium text-primaryPurple uppercase"
                                            >
                                                <ArrowBackIosIcon
                                                    sx={{ fontSize: "14px" }}
                                                />
                                                <span className="text-[12px]">
                                                    Go Back
                                                </span>
                                            </Link>
                                        </div>
                                        <div className="flex gap-2 text-sm">
                                            <p className="font-medium">Overall Status:</p>
                                            <p>{orderStatus}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {orderItems?.map((item) => {
                                const {
                                    _id,
                                    image,
                                    name,
                                    discountPrice,
                                    quantity,
                                    seller,
                                } = item;

                                return (
                                    <div
                                        className="flex flex-col sm:flex-row min-w-full shadow rounded-sm bg-white px-2 py-5"
                                        key={_id}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:w-1/2 gap-2">
                                            <div className="w-full sm:w-32 h-20">
                                                <img
                                                    draggable="false"
                                                    className="h-full w-full object-contain"
                                                    src={image}
                                                    alt={name}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <p className="text-sm">
                                                    {name.length > 60
                                                        ? `${name.substring(
                                                              0,
                                                              60
                                                          )}...`
                                                        : name}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-2">
                                                    Quantity: {quantity}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Seller: {seller?.name}
                                                </p>
                                                <span className="font-medium">
                                                    ₹
                                                    {(
                                                        quantity * discountPrice
                                                    ).toLocaleString()}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Payment Id: {paymentId}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col w-full sm:w-1/2">
                                            <Tracker
                                                orderOn={createdAt}
                                                activeStep={
                                                    item.itemStatus === "Delivered" || orderStatus === "Delivered"
                                                        ? 3
                                                        : item.itemStatus === "Cancelled" || orderStatus === "Cancelled"
                                                        ? -1
                                                        : (item.itemStatus || orderStatus) === "Out For Delivery"
                                                        ? 2
                                                        : (item.itemStatus || orderStatus) === "Shipped"
                                                        ? 1
                                                        : 0
                                                }
                                            />
                                            {orderStatus !== "Cancelled" && (
                                                <form
                                                    onSubmit={(e) => updateOrderSubmitHandler(e, _id)}
                                                    className="flex items-center gap-2 mt-2 px-4"
                                                >
                                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                                        <InputLabel>Status</InputLabel>
                                                        <Select
                                                            value={itemStatuses[_id] || ""}
                                                            label="Status"
                                                            onChange={(e) =>
                                                                setItemStatuses((prev) => ({ ...prev, [_id]: e.target.value }))
                                                            }
                                                        >
                                                            <MenuItem value="Shipped">Shipped</MenuItem>
                                                            <MenuItem value="Out For Delivery">Out For Delivery</MenuItem>
                                                            <MenuItem value="Delivered">Delivered</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    <button
                                                        type="submit"
                                                        className="bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1.5 text-xs text-white rounded shadow"
                                                    >
                                                        Update
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </main>
        </>
    );
};

export default UpdateOrders;

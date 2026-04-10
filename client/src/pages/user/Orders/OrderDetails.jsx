/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Tracker from "./Tracker";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import Spinner from "../../../components/Spinner";
import SeoData from "../../../SEO/SeoData";
import { toast } from "react-toastify";

const OrderDetails = () => {
    const params = useParams();
    const orderId = params.id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState([]);
    const [reload, setReload] = useState(false);
    const { auth } = useAuth();

    useEffect(() => {
        // fetch order detail from server
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_SERVER_URL
                    }/api/v1/user/order-detail?orderId=${orderId}`,
                    {
                        headers: {
                            Authorization: auth?.token,
                        },
                    }
                );
                console.log(...response.data.orderDetails);
                if (response?.data?.orderDetails) {
                    setOrderDetails(...response.data.orderDetails);
                    setLoading(false);
                }
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };
        fetchOrders();
    }, [auth?.token, orderId, reload]);

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

    const amount = orderDetails?.amount;
    const orderItems = orderDetails?.products;
    const buyer = orderDetails?.buyer;
    const paymentId = orderDetails?.paymentId;
    const shippingInfo = orderDetails?.shippingInfo;
    const createdAt = orderDetails?.createdAt;
    const orderStatus = orderDetails?.orderStatus;

    return (
        <>
            <SeoData title="Order Details | Flipkart" />

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
                                    <div className="flex flex-col gap-3 my-8 mx-10">
                                        {orderStatus === "Cancelled" && (
                                            <div className="bg-red-50 border border-red-200 p-3 rounded mb-2">
                                                <p className="text-red-600 font-semibold">This order has been cancelled</p>
                                            </div>
                                        )}
                                        <h3 className=" text-md font-[600]">
                                            More Actions
                                        </h3>
                                        {orderStatus !== "Delivered" && orderStatus !== "Cancelled" && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[14px]">
                                                    Cancel Order
                                                </span>
                                                <button
                                                    onClick={handleCancelOrder}
                                                    className="bg-red-600 py-2 px-4 w-[150px] text-center text-white uppercase rounded-sm text-[12px] font-[600] hover:bg-red-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px]">
                                                Download Invoice
                                            </span>
                                            <Link
                                                to="/"
                                                className="bg-white py-2 px-4 w-[150px] text-center text-primaryPurple uppercase rounded-sm text-[12px] font-[600] border-[1px] border-gray-200"
                                            >
                                                Download
                                            </Link>
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
                                                <span className="text-xs text-gray-600">
                                                    Order Date:{" "}
                                                    {new Date(
                                                        createdAt
                                                    ).toDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col w-full sm:w-1/2">
                                            <Tracker
                                                orderOn={createdAt}
                                                activeStep={(() => {
                                                    const s = item.itemStatus || orderStatus;
                                                    return s === "Delivered" ? 3 : s === "Cancelled" ? -1 : s === "Out For Delivery" ? 2 : s === "Shipped" ? 1 : 0;
                                                })()}
                                            />
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

export default OrderDetails;

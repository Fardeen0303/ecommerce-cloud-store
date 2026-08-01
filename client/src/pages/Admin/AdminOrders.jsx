import { useEffect, useState } from "react";
import OrderItem from "./OrderItem";
import SearchIcon from "@mui/icons-material/Search";
import Spinner from "../../components/Spinner";
import axios from "axios";
import { useAuth } from "../../context/auth";
import SeoData from "../../SEO/SeoData";
import { toast } from "react-toastify";

const AdminOrders = () => {
    const {auth} = useAuth();
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        // fetch orders from server
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_SERVER_URL
                    }/api/v1/user/admin-orders`,
                    {
                        headers: {
                            Authorization: auth?.token,
                        },
                    }
                );
                if (response?.data?.orders) {
                    setOrders(response.data.orders);
                    setLoading(false);
                }
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };
        fetchOrders();
    }, [auth?.token, reload]);

    const handleClearHistory = async () => {
        if (!window.confirm("Are you sure you want to delete ALL orders? This cannot be undone.")) return;
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/user/delete-all-orders`,
                { headers: { Authorization: auth?.token } }
            );
            if (res.status === 200) {
                toast.success("All orders cleared!");
                setReload(!reload);
            }
        } catch (error) {
            console.log("Clear error:", error.response?.status, error.response?.data);
            toast.error(error.response?.data?.message || "Failed to clear orders");
        }
    };

    return (
        <>
            <SeoData title="Admin Orders | EliteMarket" />

            <main className="w-full px-4 sm:px-10 py-4 ">
                <div className="flex gap-3.5 w-full ">
                    {loading ? (
                        <Spinner />
                    ) : (
                        <div className="flex flex-col gap-3 w-full pb-5 overflow-hidden">
                            <div className="flex items-center justify-between mx-auto w-[100%] sm:w-10/12">
                            <form
                                className="flex items-center flex-1 bg-white border rounded mb-2 hover:shadow-md"
                            >
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    type="search"
                                    name="search"
                                    placeholder="Search your orders here"
                                    className="p-2 text-sm outline-none flex-1 rounded-l "
                                />
                                <button
                                    type="submit"
                                    className="h-full text-sm px-1 sm:px-4 py-2.5 text-white bg-primaryPurple hover:bg-blue-600 rounded-r flex items-center gap-1"
                                >
                                    <SearchIcon sx={{ fontSize: "20px" }} />
                                    <p className="text-[10px] sm:text-[14px]">Search</p>
                                </button>
                            </form>
                            {orders?.length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    className="ml-3 mb-2 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Clear History
                                </button>
                            )}
                            </div>

                            {orders?.length === 0 && (
                                <div className="flex items-center flex-col gap-2 p-10 bg-white rounded-sm ">
                                    <img
                                        draggable="false"
                                        src="https://rukminim1.flixcart.com/www/100/100/promos/23/08/2020/c5f14d2a-2431-4a36-b6cb-8b5b5e283d4f.png"
                                        alt="Empty Orders"
                                    />
                                    <span className="text-lg font-medium">
                                        Sorry, no orders found
                                    </span>
                                    <p>Get some orders first</p>
                                </div>
                            )}

                            {orders
                                ?.map((order) => {
                                    const {
                                        _id,
                                        orderStatus,
                                        buyer,
                                        createdAt,
                                        paymentId,
                                        shippingInfo,
                                        amount,
                                        products,
                                    } = order;
                                    return products.map((item, index) => (
                                        <OrderItem
                                            item={item}
                                            key={index}
                                            orderId={_id}
                                            orderStatus={item.itemStatus || orderStatus}
                                            createdAt={createdAt}
                                            paymentId={paymentId}
                                            buyer={buyer}
                                            shippingInfo={shippingInfo}
                                            amount={amount}
                                        />
                                    ));
                                })
                                .reverse()}
                        </div>
                    )}
                </div>
                {/* <!-- orders column --> */}
                {/* <!-- row --> */}
            </main>
        </>
    );
};

export default AdminOrders;

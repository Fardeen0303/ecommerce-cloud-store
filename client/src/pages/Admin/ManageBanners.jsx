import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/auth";
import AdminMenu from "./AdminMenu";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ManageBanners = () => {
    const { auth } = useAuth();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [newBanner, setNewBanner] = useState({
        image: null,
        category: "",
        name: "",
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/product/banners/admin`,
                { headers: { Authorization: auth.token } }
            );
            setBanners(res.data.banners || []);
        } catch (error) {
            console.error("Error fetching banners:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newBanner.image || !newBanner.category || !newBanner.name) {
            toast.error("Please fill all fields");
            return;
        }

        const formData = new FormData();
        formData.append("image", newBanner.image);
        formData.append("category", newBanner.category);
        formData.append("name", newBanner.name);

        try {
            setUploading(true);
            await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/product/banners/add`,
                formData,
                {
                    headers: {
                        Authorization: auth.token,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            toast.success("Banner uploaded successfully!");
            setShowUploadForm(false);
            setNewBanner({ image: null, category: "", name: "" });
            fetchBanners();
        } catch (error) {
            console.error("Error uploading banner:", error);
            toast.error("Failed to upload banner");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this banner?")) return;

        try {
            await axios.delete(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/product/banners/delete/${id}`,
                { headers: { Authorization: auth.token } }
            );
            toast.success("Banner deleted!");
            fetchBanners();
        } catch (error) {
            console.error("Error deleting banner:", error);
            toast.error("Failed to delete banner");
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/product/banners/toggle/${id}`,
                { isActive: !currentStatus },
                { headers: { Authorization: auth.token } }
            );
            toast.success(currentStatus ? "Banner hidden" : "Banner activated");
            fetchBanners();
        } catch (error) {
            console.error("Error toggling banner:", error);
            toast.error("Failed to update banner");
        }
    };

    const activeBanners = banners.filter((b) => b.isActive);
    const inactiveBanners = banners.filter((b) => !b.isActive);

    return (
        <div className="flex flex-col sm:flex-row min-h-screen bg-gray-50">
            <AdminMenu />
            <div className="flex-1 p-6 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Manage Banners
                        </h1>
                        <button
                            onClick={() => setShowUploadForm(!showUploadForm)}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                        >
                            <CloudUploadIcon fontSize="small" />
                            {showUploadForm ? "Cancel" : "Upload New"}
                        </button>
                    </div>

                    {/* Upload Form */}
                    {showUploadForm && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Upload New Banner</h2>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Banner Name</label>
                                    <input
                                        type="text"
                                        value={newBanner.name}
                                        onChange={(e) => setNewBanner({ ...newBanner, name: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        placeholder="e.g., iPhone 15 Pro"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Category</label>
                                    <select
                                        value={newBanner.category}
                                        onChange={(e) => setNewBanner({ ...newBanner, category: e.target.value })}
                                        className="w-full border rounded-lg p-2"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Mobiles">Mobiles</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Appliances">Appliances</option>
                                        <option value="Furniture">Furniture</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Banner Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewBanner({ ...newBanner, image: e.target.files[0] })}
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                                >
                                    {uploading ? "Uploading..." : "Upload Banner"}
                                </button>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : (
                        <>
                            {/* Active Banners */}
                            <div className="mb-12">
                                <h2 className="text-2xl font-semibold mb-6 text-green-600 text-center">
                                    Active Banners ({activeBanners.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeBanners.map((banner) => (
                                        <div key={banner._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                                            <img src={banner.image.url} alt={banner.name} className="w-full h-48 object-cover" />
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg mb-1">{banner.name}</h3>
                                                <p className="text-gray-600 text-sm mb-3">{banner.category}</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => toggleActive(banner._id, banner.isActive)}
                                                        className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                                                    >
                                                        Hide
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(banner._id)}
                                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {activeBanners.length === 0 && (
                                    <p className="text-center text-gray-500">No active banners</p>
                                )}
                            </div>

                            {/* Inactive Banners */}
                            {inactiveBanners.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-6 text-gray-600 text-center">
                                        Hidden Banners ({inactiveBanners.length})
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {inactiveBanners.map((banner) => (
                                            <div key={banner._id} className="bg-white rounded-lg shadow-md overflow-hidden opacity-75 hover:opacity-100 transition">
                                                <img src={banner.image.url} alt={banner.name} className="w-full h-48 object-cover" />
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-lg mb-1">{banner.name}</h3>
                                                    <p className="text-gray-600 text-sm mb-3">{banner.category}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => toggleActive(banner._id, banner.isActive)}
                                                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                                                        >
                                                            <AddPhotoAlternateIcon fontSize="small" />
                                                            Activate
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(banner._id)}
                                                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageBanners;

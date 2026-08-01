import { Link } from "react-router-dom";

const Product = ({ image, name, offer, tag }) => {
    return (
        <Link
            to="/products"
            className="flex flex-col items-center gap-2 p-4 m-2 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-300"
        >
            <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg p-3">
                <img
                    draggable="false"
                    className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-300"
                    src={image}
                    alt={name}
                />
            </div>
            <h2 className="font-semibold text-sm text-gray-800 text-center line-clamp-2 mt-2">{name}</h2>
            <span className="text-green-600 font-bold text-sm">{offer}</span>
            <span className="text-gray-500 text-xs">{tag}</span>
        </Link>
    );
};

export default Product;

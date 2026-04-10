/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import Slider from "react-slick";
import { NextBtn, PreviousBtn } from "../Banner/Banner";
import { Link } from "react-router-dom";
import axios from "axios";

export const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    swipe: true,
    prevArrow: <PreviousBtn />,
    nextArrow: <NextBtn />,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        },
    ],
};

const ProductSlider = ({ title, category }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_SERVER_URL}/api/v1/product/filtered-products`,
                    {
                        params: {
                            category: category,
                        },
                    }
                );
                if (res.status === 201) {
                    setProducts(res.data.products.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        if (category) {
            fetchProducts();
        }
    }, [category]);

    return (
        <section className="bg-white w-full shadow-lg rounded-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <Link
                    to={`/products?category=${category}`}
                    className="bg-gradient-to-r from-purple-600 to-purple-800 text-sm font-semibold text-white px-6 py-2.5 rounded-full hover:shadow-xl transition-all"
                >
                    VIEW ALL →
                </Link>
            </div>
            {products.length > 0 ? (
                <Slider {...settings}>
                    {products.map((product) => (
                        <Link
                            key={product._id}
                            to={`/product/${product._id}`}
                            className="flex flex-col items-center gap-2 p-4 m-2 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-300"
                        >
                            <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg p-3">
                                <img
                                    draggable="false"
                                    className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-300"
                                    src={product.images[0]?.url}
                                    alt={product.name}
                                />
                            </div>
                            <h2 className="font-semibold text-sm text-gray-800 text-center line-clamp-2 mt-2">
                                {product.name}
                            </h2>
                            <span className="text-green-600 font-bold text-sm">
                                ₹{product.discountPrice.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-xs line-through">
                                ₹{product.price.toLocaleString()}
                            </span>
                        </Link>
                    ))}
                </Slider>
            ) : (
                <p className="text-center text-gray-500 py-8">No products available</p>
            )}
        </section>
    );
};

export default ProductSlider;

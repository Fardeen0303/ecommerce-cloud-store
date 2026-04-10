/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Banner.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Link } from "react-router-dom";
import axios from "axios";
import { getDefaultBannersWithGenerated, categoryBannerConfig } from "../../../utils/bannerGenerator";

export const PreviousBtn = ({ className, onClick }) => {
    return (
        <div className={className} onClick={onClick}>
            <ArrowBackIosIcon />
        </div>
    );
};

export const NextBtn = ({ className, onClick }) => {
    return (
        <div className={className} onClick={onClick}>
            <ArrowForwardIosIcon />
        </div>
    );
};

const Banner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const defaultBanners = getDefaultBannersWithGenerated();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/product/banners/all`
            );
            if (res.data.banners && res.data.banners.length > 0) {
                setBanners(
                    res.data.banners.map((b) => ({
                        image: b.image.url,
                        category: b.category,
                        isUploaded: true
                    }))
                );
            } else {
                setBanners(defaultBanners);
            }
        } catch (error) {
            console.error("Error fetching banners:", error);
            setBanners(defaultBanners);
        } finally {
            setLoading(false);
        }
    };

    const settings = {
        autoplay: true,
        autoplaySpeed: 3000,
        dots: false,
        infinite: true,
        speed: 1500,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: <PreviousBtn />,
        nextArrow: <NextBtn />,
    };

    if (loading) {
        return (
            <section className="w-full px-2 sm:px-4">
                <div className="rounded-2xl overflow-hidden h-[180px] sm:h-[300px] bg-gray-200 animate-pulse"></div>
            </section>
        );
    }

    return (
        <>
            <section className="w-full px-2 sm:px-4">
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <Slider {...settings}>
                        {banners.map((el, i) => (
                            <Link key={i} to={`/products?category=${el.category}`}>
                                {el.isUploaded ? (
                                    <div className="relative cursor-pointer">
                                        <img
                                            draggable="false"
                                            className="h-[180px] sm:h-[300px] w-full object-cover"
                                            src={el.image}
                                            alt={`${el.category} banner`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                    </div>
                                ) : (
                                    <div 
                                        className="relative cursor-pointer h-[180px] sm:h-[300px] w-full flex items-center justify-between px-8 sm:px-16 overflow-hidden"
                                        style={{ background: el.config.gradient }}
                                    >
                                        <div className="absolute inset-0">
                                            <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-64 h-64 sm:w-[500px] sm:h-[500px] rounded-full bg-white/10 blur-3xl"></div>
                                            <div className="absolute -right-20 -top-10 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-white/5 blur-2xl"></div>
                                            <div className="absolute left-1/3 -bottom-20 w-56 h-56 sm:w-[400px] sm:h-[400px] rounded-full bg-black/10 blur-3xl"></div>
                                        </div>
                                        <div className="relative z-10 text-white max-w-xl">
                                            <div className="text-4xl sm:text-7xl mb-2 sm:mb-4 drop-shadow-lg">{el.config.icon}</div>
                                            <h2 className="text-2xl sm:text-5xl font-bold mb-1 sm:mb-3 drop-shadow-md">{el.category}</h2>
                                            <p className="text-sm sm:text-2xl opacity-95 font-medium drop-shadow">{el.config.tagline}</p>
                                            <button className="mt-3 sm:mt-6 px-4 sm:px-8 py-2 sm:py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-xs sm:text-lg font-semibold transition-all border border-white/30 hover:scale-105">
                                                Shop Now →
                                            </button>
                                        </div>
                                        <div className="hidden sm:block relative z-10 text-white/20 text-[200px] font-black leading-none">
                                            {el.config.icon}
                                        </div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </Slider>
                </div>
            </section>
        </>
    );
};

export default Banner;

/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { settings } from "../DealSlider/DealSlider";
import Product from "./Product";
import { offerProducts } from "../../../utils/constants";
import { getRandomProducts } from "../../../utils/functions";

const Suggestion = ({ title, tagline }) => {
    return (
        <section className="bg-white w-full shadow-lg rounded-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    <p className="text-sm text-purple-600 mt-1">{tagline}</p>
                </div>
                <Link
                    to="/products"
                    className="bg-gradient-to-r from-purple-600 to-purple-800 text-sm font-semibold text-white px-6 py-2.5 rounded-full hover:shadow-xl transition-all uppercase"
                >
                    view all →
                </Link>
            </div>

            <Slider {...settings}>
                {offerProducts &&
                    getRandomProducts(offerProducts, 12).map((product, i) => (
                        <Product {...product} key={i} />
                    ))}
            </Slider>
        </section>
    );
};

export default Suggestion;

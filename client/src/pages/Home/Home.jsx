import { useAuth } from "../../context/auth";
import ScrollToTopOnRouteChange from "../../utils/ScrollToTopOnRouteChange";
import Categories from "../../components/header/Categories";
import Banner from "./Banner/Banner";
import DealSlider from "./DealSlider/DealSlider";
import ProductSlider from "./ProductsListing/ProductSlider";
import { electronicProducts } from "../../utils/electronics";
import { accessories } from "../../utils/accessories";
import { fashionProducts } from "../../utils/fashion";
import { applianceProducts } from "../../utils/appliances";
import { furnitureProducts } from "../../utils/furniture";
import electronics from "../../assets/images/electronics-card.jpg";
import accessoryCard from "../../assets/images/accessory-card.jpg";
import fashionCard from "../../assets/images/fashion-card.jpg";
import applianceCard from "../../assets/images/appliance-card.jpg";
import furnitureCard from "../../assets/images/furniture-card.jpg";
import Suggestion from "./Suggestions/Suggestion";
import SeoData from "../../SEO/SeoData";

const Home = () => {
    return (
        <>
            <SeoData title="Online Shopping Site for Mobiles, Electronics, Furniture, Grocery, Lifestyle, Books & More. Best Offers!" />
            <ScrollToTopOnRouteChange />
            <Categories />
            <main className="flex flex-col items-center gap-6 px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50">
                {/* <pre className="min-h-[60vh]">
                    {JSON.stringify(auth, null, 3)}
                </pre> */}
                <Banner />
                <DealSlider title={"Discounts for You"} />
                <ProductSlider
                    title={"Best of Electronics"}
                    category={"Electronics"}
                />
                <ProductSlider
                    title={"Fashion Top Deals"}
                    category={"Fashion"}
                />
                <ProductSlider
                    title={"Appliances"}
                    category={"Appliances"}
                />
                <ProductSlider
                    title={"Furniture & More"}
                    category={"Furniture"}
                />
            </main>
        </>
    );
};

export default Home;

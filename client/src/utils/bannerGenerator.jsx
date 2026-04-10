export const categoryBannerConfig = {
    Mobiles: {
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        icon: "📱",
        tagline: "Latest Smartphones"
    },
    Fashion: {
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        icon: "👗",
        tagline: "Trending Styles"
    },
    Electronics: {
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        icon: "💻",
        tagline: "Tech Essentials"
    },
    Appliances: {
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        icon: "🏠",
        tagline: "Home Appliances"
    },
    Furniture: {
        gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
        icon: "🏡",
        tagline: "Comfort & Style"
    }
};

export const getDefaultBannersWithGenerated = () => {
    return Object.keys(categoryBannerConfig).map(category => ({
        category: category,
        config: categoryBannerConfig[category]
    }));
};

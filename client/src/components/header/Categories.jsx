import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DevicesIcon from '@mui/icons-material/Devices';
import KitchenIcon from '@mui/icons-material/Kitchen';
import ChairIcon from '@mui/icons-material/Chair';
import { Link } from "react-router-dom";

const catNav = [
    {
        name: "Mobiles",
        icon: PhoneAndroidIcon,
        color: "from-blue-500 to-blue-600",
    },
    {
        name: "Fashion",
        icon: CheckroomIcon,
        color: "from-pink-500 to-pink-600",
    },
    {
        name: "Electronics",
        icon: DevicesIcon,
        color: "from-purple-500 to-purple-600",
    },
    {
        name: "Appliances",
        icon: KitchenIcon,
        color: "from-orange-500 to-orange-600",
    },
    {
        name: "Furniture",
        icon: ChairIcon,
        color: "from-green-500 to-green-600",
    },
];

const Categories = () => {
    return (
        <section className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-b border-purple-100">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center overflow-x-auto gap-4 py-4">
                    {catNav.map((item, i) => {
                        const IconComponent = item.icon;
                        return (
                            <Link
                                to={`/products?category=${item.name}`}
                                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-all min-w-fit group border-2 border-purple-200 hover:border-transparent shadow-sm hover:shadow-lg"
                                key={i}
                            >
                                <div className={`h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:bg-white transition-all`}>
                                    <IconComponent 
                                        className="text-white group-hover:text-purple-600 transition-colors" 
                                        sx={{ fontSize: '28px' }}
                                    />
                                </div>
                                <span className="text-lg font-bold text-gray-700 group-hover:text-white transition-colors">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Categories;

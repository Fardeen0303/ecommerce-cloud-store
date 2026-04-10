/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { BiHomeSmile } from "react-icons/bi";
import { AiOutlineUser, AiOutlineHeart } from "react-icons/ai";
import { BsCart2, BsBox } from "react-icons/bs";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdLogin, MdLogout } from "react-icons/md";
import { useAuth } from "../../context/auth";
import SearchBar from "./SearchBar";
import { useCart } from "../../context/cart";
// import { toast } from "react-toastify";
// import LogOut from "../../pages/Auth/LogOut";

const Header = () => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const headerRef = useRef(null);

    const {auth, setAuth, LogOut} = useAuth();
    const [cartItems, setCartItems] = useCart();

    let closeTimeout;
    const toggleDropdown = () => {
        clearTimeout(closeTimeout);
        setDropdownOpen(true);
    };
    const closeDropdown = () => {
        closeTimeout = setTimeout(() => {
            setDropdownOpen(false);
        }, 200);
    };

    const handleLogout = () => {
        LogOut();
    };

    const handleStickyHeader = () => {
        if (
            document.body.scrollTop > 0 ||
            document.documentElement.scrollTop > 0
        ) {
            headerRef.current.classList.add("sticky__header");
        } else {
            headerRef.current.classList.remove("sticky__header");
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleStickyHeader);
        //clean up function
        return () => {
            window.removeEventListener("scroll", handleStickyHeader);
        };
    });
    return (
        <header ref={headerRef} className="bg-white shadow-md">
            <nav
                className="container px-4 md:px-[50px]"
                // onMouseLeave={closeDropdown}
            >
                <div className=" flex items-center justify-between gap-3 md:gap-14 w-full flex-col md:flex-row sm:flex-row lg:flex-row">
                    {/* primary div */}
                    <div className=" sm:h-[100px] md:h-[70px] lg:h-[70px] flex items-center justify-between w-[100%] max-w-[650px]">
                        <div className=" flex gap-[20px] items-center w-[100%] flex-col md:flex-row sm:flex-row lg:flex-row">
                            {/* logo */}
                            <Link to="/" className="flex items-center">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                                    Elite<span className="text-orange-500">Market</span>
                                </h1>
                            </Link>

                            {/* search bar*/}
                            <SearchBar />
                            {/* search bar*/}
                        </div>
                    </div>

                    {/* secondary div */}
                    <div className="flex items-center justify-between gap-[50px] w-[70%] mb-4 md:mb-0">
                        {/* home */}
                        <div className="flex items-center group">
                            <NavLink 
                                to="/" 
                                className={({ isActive }) => 
                                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white'
                                    }`
                                }
                            >
                                <BiHomeSmile className="text-[20px]" />
                                <span className="text-[16px] font-semibold hidden md:block lg:block">
                                    Home
                                </span>
                            </NavLink>
                        </div>

                        {/* Account */}
                        <div
                            className={`flex items-center relative cursor-pointer group hover:bg-purple-50 rounded-md p-1`}
                            onMouseEnter={toggleDropdown}
                            onMouseLeave={closeDropdown}
                        >
                            {auth.user ? (
                                <div className="flex items-center gap-1 text-gray-700">
                                    <AiOutlineUser className="text-[22px]" />
                                    <span className="text-[18px] max-w-fit hidden md:block lg:block font-semibold">
                                        <p>{auth.user.name.split(" ")[0]}</p>
                                    </span>
                                    <span>
                                        <RiArrowDropDownLine className="group-hover:rotate-[180deg] transition-all" />
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-gray-700">
                                    <Link
                                        to="/login"
                                        className="flex gap-1 text-gray-700 font-semibold"
                                    >
                                        <AiOutlineUser className="text-[22px]" />
                                        <span className="text-[18px] max-w-fit hidden md:block lg:block ">
                                            <p>Sign in</p>
                                        </span>
                                    </Link>
                                    <span>
                                        <RiArrowDropDownLine
                                            className="group-hover:rotate-[180deg] transition-all"
                                        />
                                    </span>
                                </div>
                            )}

                            {/* dropdown menu */}
                            {isDropdownOpen && (
                                <div
                                    className="absolute top-[36px] -left-[2px] z-50 bg-white border border-gray-300 rounded-md p-2 w-[140px] transition-all flex flex-col text-black"
                                    onMouseEnter={toggleDropdown}
                                    onMouseLeave={closeDropdown}
                                >
                                    <ul>
                                        {!auth.user && (
                                            <li className="p-1 hover:bg-slate-100 rounded-md">
                                                <Link
                                                    to="/register"
                                                    className="flex items-center gap-3"
                                                >
                                                    <MdLogin className="text-[14px]" />
                                                    <span className="text-[16px]">
                                                        Sign up
                                                    </span>
                                                </Link>
                                            </li>
                                        )}
                                        <li className="p-1 hover:bg-slate-100 rounded-md">
                                            <Link
                                                to={`${
                                                    auth?.user?.role === 1
                                                        ? "/admin"
                                                        : "/user"
                                                }/dashboard`}
                                                className="flex items-center gap-3"
                                            >
                                                <AiOutlineUser className="text-[14px]" />
                                                <span className="text-[16px]">
                                                    My Profile
                                                </span>
                                            </Link>
                                        </li>
                                        {/* if user is not admin */}
                                        {auth.user?.role !== 1 && (
                                            <li className="p-1 hover:bg-slate-100 rounded-md">
                                                <Link
                                                    to="/user/wishlist"
                                                    className="flex items-center gap-3"
                                                >
                                                    <AiOutlineHeart className="text-[14px]" />
                                                    <span className="text-[16px]">
                                                        Wishlist
                                                    </span>
                                                </Link>
                                            </li>
                                        )}
                                        <li className="p-1 hover:bg-slate-100 rounded-md">
                                            <Link
                                                to={`${
                                                    auth?.user?.role === 1
                                                        ? "/admin"
                                                        : "/user"
                                                }/orders`}
                                                className="flex items-center gap-3"
                                            >
                                                <BsBox className="text-[14px]" />
                                                <span className="text-[16px]">
                                                    Orders
                                                </span>
                                            </Link>
                                        </li>

                                        {auth.user && (
                                            <li className="p-1 hover:bg-slate-100 rounded-md ">
                                                <Link
                                                    onClick={handleLogout}
                                                    to="/login"
                                                    className="flex items-center gap-3"
                                                >
                                                    <MdLogout className="text-[14px]" />
                                                    <span className="text-[16px]">
                                                        Logout
                                                    </span>
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* cart */}
                        {auth?.user?.role !== 1 && (
                            <div className="flex items-center gap-1 group">
                                <NavLink
                                    to="/cart"
                                    className="relative flex items-center gap-1 text-gray-700"
                                >
                                    <span className="absolute w-5 h-5 text-[11px] text-center font-bold left-2 bottom-3 text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                                        {cartItems?.length}
                                    </span>
                                    <BsCart2 className="text-[22px]" />
                                    <span className="hidden md:block lg:block group-hover:text-purple-600">
                                        <p className="text-[18px]">Cart</p>
                                    </span>
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;

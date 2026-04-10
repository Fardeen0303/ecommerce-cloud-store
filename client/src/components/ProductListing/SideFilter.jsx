/* eslint-disable react/prop-types */
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Slider from "@mui/material/Slider";
import StarIcon from "@mui/icons-material/Star";
import FilterListIcon from "@mui/icons-material/FilterList";
import { categories } from "../../utils/constants";
import { useState, useRef, useEffect } from "react";

const SideFilter = ({
    price,
    category,
    ratings,
    setPrice,
    setCategory,
    setRatings,
}) => {
    const debounceTimeout = useRef(null);

    // Debounce priceHandler to prevent multiple API calls on slider change
    const priceHandler = (_, newPrice) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            // Round the price values to the nearest multiple of 1000
            let newVal = [
                Math.round(newPrice[0] / 1000) * 1000,
                Math.round(newPrice[1] / 1000) * 1000,
            ];
            setPrice(newVal);
        }, 100);
    };

    useEffect(() => {
        return () => {
            // Clean up the timeout when the component unmounts
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);

    const clearFilters = () => {
        setPrice([0, 200000]);
        setCategory("");
        setRatings(0);
    };

    return (
        <div className="hidden sm:flex flex-col w-1/5 px-1">
            <div className="flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg border border-purple-100">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <FilterListIcon className="text-white" sx={{ fontSize: "20px" }} />
                        <p className="text-lg font-bold text-white">Filters</p>
                    </div>
                    <button
                        className="text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-all"
                        onClick={() => clearFilters()}
                    >
                        Clear All
                    </button>
                </div>

                <div className="flex flex-col gap-5 p-5">
                    {/* Price slider filter */}
                    <div className="flex flex-col gap-3 bg-white rounded-lg p-4 shadow-sm">
                        <span className="font-bold text-sm text-gray-700 uppercase tracking-wide">Price Range</span>

                        <Slider
                            value={price}
                            onChange={priceHandler}
                            valueLabelDisplay="auto"
                            getAriaLabel={() => "Price range slider"}
                            min={0}
                            max={200000}
                            sx={{
                                color: '#7c3aed',
                                '& .MuiSlider-thumb': {
                                    backgroundColor: '#7c3aed',
                                },
                                '& .MuiSlider-track': {
                                    backgroundColor: '#7c3aed',
                                },
                                '& .MuiSlider-rail': {
                                    backgroundColor: '#e9d5ff',
                                },
                            }}
                        />

                        <div className="flex gap-2 items-center">
                            <div className="flex-1 border-2 border-purple-200 rounded-lg bg-purple-50">
                                <span className="text-xs text-gray-500 block px-3 pt-2">Min</span>
                                <input
                                    type="number"
                                    value={price[0] === 0 ? '' : price[0]}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        if (val <= price[1]) {
                                            setPrice([val, price[1]]);
                                        }
                                    }}
                                    className="w-full bg-transparent px-3 pb-2 font-semibold text-purple-700 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="flex-1 border-2 border-purple-200 rounded-lg bg-purple-50">
                                <span className="text-xs text-gray-500 block px-3 pt-2">Max</span>
                                <input
                                    type="number"
                                    value={price[1] === 200000 ? '' : price[1]}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 200000;
                                        if (val >= price[0] && val <= 200000) {
                                            setPrice([price[0], val]);
                                        }
                                    }}
                                    className="w-full bg-transparent px-3 pb-2 font-semibold text-purple-700 outline-none"
                                    placeholder="200000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category filter */}
                    <div className="flex flex-col gap-3 bg-white rounded-lg p-4 shadow-sm">
                        <p className="font-bold text-sm text-gray-700 uppercase tracking-wide">Category</p>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="category-radio-buttons-group"
                                onChange={(e) => setCategory(e.target.value)}
                                name="category-radio-buttons"
                                value={category}
                            >
                                {categories.map((el, i) => (
                                    <FormControlLabel
                                        value={el}
                                        key={i}
                                        control={
                                            <Radio 
                                                size="small" 
                                                sx={{
                                                    color: '#a78bfa',
                                                    '&.Mui-checked': {
                                                        color: '#7c3aed',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <span className="text-sm text-gray-700 hover:text-purple-600 transition-colors" key={i}>
                                                {el}
                                            </span>
                                        }
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </div>

                    {/* Ratings filter */}
                    <div className="flex flex-col gap-3 bg-white rounded-lg p-4 shadow-sm">
                        <p className="font-bold text-sm text-gray-700 uppercase tracking-wide">Ratings</p>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="ratings-radio-buttons-group"
                                onChange={(e) => setRatings(e.target.value)}
                                value={ratings}
                                name="ratings-radio-buttons"
                            >
                                {[5, 4, 3, 2].map((el, i) => (
                                    <FormControlLabel
                                        value={el}
                                        key={i}
                                        control={
                                            <Radio 
                                                size="small" 
                                                sx={{
                                                    color: '#a78bfa',
                                                    '&.Mui-checked': {
                                                        color: '#7c3aed',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <span className="flex items-center text-sm text-gray-700">
                                                <span className="font-semibold">{el}</span>
                                                <StarIcon
                                                    sx={{
                                                        fontSize: "14px",
                                                        mx: 0.5,
                                                        color: '#fbbf24',
                                                    }}
                                                />
                                            </span>
                                        }
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SideFilter;

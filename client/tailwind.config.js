/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primaryPurple: "#7c3aed",
                primaryTeal: "#14b8a6",
                accentOrange: "#f97316",
                primaryBg: "#f8fafc",
                textHover: "#475569",
                lightPurple: "#faf5ff",
            },
            boxShadow: {
                primaryShadow: "0px_0px_8px_2px_rgba(212,212,212,0.6)",
            },
        },
    },
    plugins: [],
};

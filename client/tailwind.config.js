/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./public/**/*.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                "noto-serif-sc": ["Noto Serif SC", "serif"],
            },
        },
    },
    plugins: [],
};

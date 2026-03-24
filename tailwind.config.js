/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                adiptify: {
                    navy: "#2D3C59",
                    olive: "#94A378",
                    gold: "#E5BA41",
                    terracotta: "#D1855C",
                },
            },
            fontFamily: {
                sans: ['Inter', 'Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

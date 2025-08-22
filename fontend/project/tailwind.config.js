/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        darkbg: '#1B1C1D',
        dark2: "#333537",
        chatbg: '#282A2C',
        primarychat: '#1A4D2E',
        primary2: "#26D367",
      }
    },
  },
  plugins: [],
};

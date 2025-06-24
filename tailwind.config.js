/** @type {import('tailwindcss').Config} */
export default {
content: [
  './src/**/*.{js,jsx,ts,tsx}',
  './path/to/other/files/**/*.{js,jsx,ts,tsx}', // Add if Navbar is elsewhere
],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        secondary: '#F3F4F6',
        accent: '#2563EB',
        text: '#1F2937',
        error: '#EF4444',
        success: '#10B981',
      },
    },
  },
  plugins: [],
};
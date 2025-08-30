/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'max-w-xs', 'mx-auto', 'card', 'btn', 'title', 'rounded-2xl', 'shadow-lg', 'bg-white',
    'flex', 'flex-col', 'justify-between', 'min-h-[180px]', 'text-blue-900', 'text-blue-800',
    'text-blue-700', 'text-blue-600', 'text-gray-500', 'bg-blue-100', 'hover:bg-blue-200',
    'hover:bg-blue-700', 'hover:shadow-xl', 'group', 'block', 'p-6', 'mb-4', 'ml-5', 'mt-1',
    'mt-auto', 'cursor-pointer', 'transition-all', 'duration-200', 'overflow-hidden',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
    },
  },
  plugins: [],
} 
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC05',
          green: '#34A853',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          variant: '#F1F3F4',
          hover: '#F8F9FA',
        },
        on: {
          surface: '#202124',
          variant: '#5F6368',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'google': '0 1px 2px 0 rgba(60,64,67,0.302), 0 1px 3px 1px rgba(60,64,67,0.149)',
        'google-hover': '0 1px 3px 0 rgba(60,64,67,0.302), 0 4px 8px 3px rgba(60,64,67,0.149)',
      }
    },
  },
  plugins: [],
}

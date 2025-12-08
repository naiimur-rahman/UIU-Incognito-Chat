/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6600',
          dark: '#e65c00',
        },
        status: {
          green: '#2ecc71',
        },
        verified: {
          blue: '#1da1f2',
        },
        admin: {
          gold: '#ffd700',
        },
        ai: {
          light: '#007bff',
          dark: '#3eadcf',
        },
        'text-color': '#333',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        'bot-gradient': 'linear-gradient(135deg, #8a7bff 0%, #ada2ff 100%)',
      },
      animation: {
        'pop-up': 'popUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'fade-in': 'fadeIn 0.5s ease-out',
        'float-up': 'floatUp 0.3s ease',
        'float-logo': 'floatLogo 3s ease-in-out infinite',
      },
      keyframes: {
        popUp: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        floatUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        floatLogo: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

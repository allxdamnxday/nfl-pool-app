/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nfl-blue': '#013369',
        'nfl-purple': '#4F2D7F',
        'nfl-gold': '#D3BC8D',
        'nfl-white': '#FFFFFF',
        'nfl-light-blue': '#1B48E0',
        'field-green': '#368356',
        'leather-brown': '#8B4513',
        gray: {
          650: '#3a3a3a',
          750: '#2a2a2a',
          850: '#1a1a1a',
          900: '#121212',
        },
        'dashboard-bg-from': '#121212',
        'dashboard-bg-to': '#1a1a1a',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.nfl-purple"), 0 0 20px theme("colors.nfl-purple")',
        'card': '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        'lg-purple': '0 10px 15px -3px rgba(79, 45, 127, 0.1), 0 4px 6px -2px rgba(79, 45, 127, 0.05)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 0.3s ease-in-out',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 5px theme("colors.nfl-purple"), 0 0 10px theme("colors.nfl-purple")' },
          'to': { boxShadow: '0 0 20px theme("colors.nfl-purple"), 0 0 30px theme("colors.nfl-purple")' },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      zIndex: {
        '50': '50',
        '100': '100',
      },
      transitionProperty: {
        'max-height': 'max-height',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
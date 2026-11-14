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
        pastel: {
          lavender: {
            50: '#FAF5FF',
            100: '#F3E8FF',
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',
            600: '#9333EA',
          },
          peach: {
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#F97316',
          },
          mint: {
            50: '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#4ADE80',
            500: '#22C55E',
          },
          matcha: {
            50: '#F4F7ED',
            100: '#E5EDD4',
            200: '#C8DCA7',
            300: '#ABC97B',
            400: '#8EB653',
            500: '#739A39',
          },
          bubblegum: {
            50: '#FDF2F8',
            100: '#FCE7F3',
            200: '#FBCFE8',
            300: '#F9A8D4',
            400: '#F472B6',
            500: '#EC4899',
          },
          butter: {
            50: '#FEFCE8',
            100: '#FEF9C3',
            200: '#FEF08A',
            300: '#FDE047',
            400: '#FACC15',
            500: '#EAB308',
          },
          sky: {
            50: '#F0F9FF',
            100: '#E0F2FE',
            200: '#BAE6FD',
            300: '#7DD3FC',
            400: '#38BDF8',
            500: '#0EA5E9',
          }
        },
        surface: {
          canvas: '#F8F7F4',
          card: '#FFFFFF',
          'dark-canvas': '#0D0F17',
          'dark-card': '#151824',
          'dark-muted': '#1E2333',
        }
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'sans-serif'
        ],
        display: [
          '"Space Grotesk"',
          '"Plus Jakarta Sans"',
          'sans-serif'
        ]
      },
      borderRadius: {
        '2.5xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft': '0 8px 30px -4px rgba(0, 0, 0, 0.04), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 16px 40px -8px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.03)',
        'soft-xl': '0 24px 60px -12px rgba(0, 0, 0, 0.08), 0 12px 24px -6px rgba(0, 0, 0, 0.04)',
        'pastel-glow': '0 0 40px -10px rgba(168, 85, 247, 0.15)',
        'mint-glow': '0 0 40px -10px rgba(34, 197, 94, 0.15)',
        'peach-glow': '0 0 40px -10px rgba(249, 115, 22, 0.15)',
      }
    },
  },
  plugins: [],
}

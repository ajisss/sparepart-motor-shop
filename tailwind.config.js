/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand green scale — see src/styles/tokens.md (Figma `Primary/*` variables).
        // Only the shades below are defined in Figma; do not add 50/300/400/500.
        primary: {
          25: '#F7FEE7',
          100: '#D8F999',
          200: '#BBF451',
          600: '#497D00',
          700: '#3C6300',
          800: '#35530E',
          900: '#192E03',
          DEFAULT: '#497D00',
        },
        // Neutral scale — see src/styles/tokens.md (Figma `Greyscale/*` variables).
        neutral: {
          0: '#FFFFFF',
          25: '#F9F9F9',
          50: '#F3F4F2',
          100: '#E7E9E5',
          200: '#CFD3CC',
          600: '#707A66',
          800: '#404D33',
          900: '#102100',
        },
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
      },
      borderRadius: {
        md: '12px',
        // Pill radius used by buttons/badges/icon containers in the Figma file.
        // Kept as a distinct token (not overriding Tailwind's default `full`,
        // which stays 9999px for perfect circles).
        pill: '100px',
      },
      boxShadow: {
        input: '0px 0.5px 0.75px rgba(49, 54, 44, 0.012)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand primary — BLACK ramp (see src/styles/tokens.md). Strong shades
        // (600–900) are black; light shades (25–300) are near-neutral greys used
        // for subtle surfaces/borders. Primary = actions, emphasis, dark surfaces.
        primary: {
          25: '#F4F4F5',
          100: '#E4E4E7',
          200: '#D4D4D8',
          300: '#A1A1AA',
          600: '#000000',
          700: '#262626',
          800: '#171717',
          900: '#000000',
          DEFAULT: '#000000',
        },
        // Brand secondary — YELLOW accent ramp (#FEC901). Used for highlights:
        // ratings, active chips, badges, accents on dark surfaces. `secondary-800`
        // is a dark amber for legible text on light-yellow backgrounds.
        secondary: {
          25: '#FFFDF0',
          100: '#FFF3C4',
          200: '#FFE885',
          600: '#FEC901',
          700: '#E5B400',
          800: '#8A6D00',
          900: '#4D3D00',
          DEFAULT: '#FEC901',
        },
        // Neutral greyscale (pure grey — no colour cast).
        neutral: {
          0: '#FFFFFF',
          25: '#FAFAFA',
          50: '#F4F4F5',
          100: '#E4E4E7',
          200: '#D4D4D8',
          600: '#71717A',
          800: '#27272A',
          900: '#0A0A0A',
        },
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB',
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

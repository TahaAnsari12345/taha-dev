/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        fg: token('fg'),
        muted: token('muted'),
        brand: token('brand'),
        cyan: { DEFAULT: token('cyan') },
        violet: { DEFAULT: token('violet') },
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--brand) / 0.55)',
        'glow-cyan': '0 0 40px -8px rgb(var(--cyan) / 0.5)',
      },
      keyframes: {
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        blink: { '50%': { opacity: '0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        flow: { to: { strokeDashoffset: '-24' } },
      },
      animation: {
        'spin-slow': 'spin-slow 8s linear infinite',
        blink: 'blink 1s steps(1) infinite',
        float: 'float 6s ease-in-out infinite',
        flow: 'flow 1.2s linear infinite',
      },
    },
  },
  plugins: [],
};

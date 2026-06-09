/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        vt: ['"VT323"', 'monospace'],
      },
      keyframes: {
        'pop': {
          '0%':   { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
        'appear': {
          '0%':   { transform: 'scale(0.55)', opacity: '0.3' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      animation: {
        'pop':      'pop 0.14s ease-out',
        'appear':   'appear 0.13s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'blink':    'blink 1.1s step-end infinite',
      },
    },
  },
  plugins: [],
}

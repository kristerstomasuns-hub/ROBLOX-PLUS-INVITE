/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        panel: '#f7f7f8',
        line: '#e5e6ea',
        ink: '#202227',
        soft: '#494d5a',
        muted: '#707070',
        accent: '#335fff',
        success: '#0b7a54',
        danger: '#df281f',
      },
      borderRadius: {
        card: '8px',
      },
      fontFamily: {
        sans: [
          'Builder Sans',
          'Inter Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}

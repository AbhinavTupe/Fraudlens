export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)',
        soft: '0 8px 24px -8px rgba(16, 24, 40, 0.14), 0 2px 6px -2px rgba(16, 24, 40, 0.06)',
        drawer: '-16px 0 48px -12px rgba(16, 24, 40, 0.18)',
        bar: '0 -4px 24px -8px rgba(16, 24, 40, 0.16), 0 2px 6px -2px rgba(16, 24, 40, 0.06)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

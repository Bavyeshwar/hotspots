/** Design tokens live here. Components reference these names, never raw hex. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces (navy / charcoal)
        bg: '#0a111f',
        surface: '#0f1829',
        raised: '#152036',
        line: '#1f2d46',
        'line-strong': '#2c3d5c',
        // Text
        ink: '#e8eef8',
        muted: '#93a3bf',
        faint: '#62738f',
        // Accents: cyan = MODIS / primary action, ember = VIIRS / emphasis
        cyan: { 300: '#7be3ee', 400: '#3dd0e0', 500: '#1fb4c8', 600: '#168fa1' },
        ember: { 300: '#ffb36b', 400: '#ff9640', 500: '#ec7c22', 600: '#c4631a' },
        // Status
        ok: '#5ccf9b',
        warn: '#f2c14e',
        danger: '#ef6b5b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '10px',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 24px -14px rgba(0,0,0,0.6)',
        pop: '0 12px 32px -8px rgba(0,0,0,0.7)',
      },
      fontSize: {
        eyebrow: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
      },
    },
  },
  plugins: [],
};

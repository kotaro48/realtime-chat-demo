/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        jp:   ['"Noto Sans JP"', 'sans-serif'],
        ui:   ['"Noto Sans JP"', 'sans-serif'],
        mono: ['"Noto Sans JP"', 'sans-serif'],
        sans: ['"Noto Sans JP"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Design tokens */
        'page-bg':    'rgb(var(--page-bg) / <alpha-value>)',
        'bg':         'rgb(var(--bg) / <alpha-value>)',
        'bg-2':       'rgb(var(--bg-2) / <alpha-value>)',
        'bg-3':       'rgb(var(--bg-3) / <alpha-value>)',
        'ds-border':  'rgb(var(--border) / <alpha-value>)',
        'ds-border-2':'rgb(var(--border-2) / <alpha-value>)',
        'ds-text':    'rgb(var(--text) / <alpha-value>)',
        'ds-text-2':  'rgb(var(--text-2) / <alpha-value>)',
        'ds-text-3':  'rgb(var(--text-3) / <alpha-value>)',
        'ds-text-4':  'rgb(var(--text-4) / <alpha-value>)',
        'ds-accent':  'rgb(var(--accent) / <alpha-value>)',
        'ds-accent-2':'rgb(var(--accent-2) / <alpha-value>)',
        'ds-accent-bg':'rgb(var(--accent-bg) / <alpha-value>)',

        /* shadcn/ui compatibility */
        border:     'rgb(var(--border) / <alpha-value>)',
        input:      'rgb(var(--input) / <alpha-value>)',
        ring:       'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT:    'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT:    'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
      },
      borderRadius: {
        sm:   '8px',
        md:   '10px',
        lg:   '12px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

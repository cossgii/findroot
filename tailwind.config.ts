import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        mobile: '375px',
        tablet: '744px',
        desktop: '1200px',
      },
      spacing: {
        header: 'var(--height-header)',
        floatingBar: 'var(--height-floating-bar)',
      },
      fontFamily: {
        pretendard: [
          'var(--font-pretendard)',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
        ],
      },
      colors: {
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        secondary: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        territory: {
          600: '#DC2626',
        },
      },
      boxShadow: {
        'card-hover':
          '2px 2px 12px 0px #DBDBDB33, -2px -2px 12px 0px #DBDBDB33',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate'), require('tailwind-scrollbar')],
};
export default config;

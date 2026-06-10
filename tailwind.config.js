/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Forest Green
        'ag-primary':       '#012D1D',
        'ag-primary-cont':  '#1B4332',
        'ag-primary-fixed': '#C1ECD4',
        // Secondary — Burnt Amber
        'ag-amber':         '#904D00',
        'ag-amber-cont':    '#FE932C',
        // Payment
        'ag-pay':           '#4CAF50',
        // Backgrounds
        'ag-canvas':        '#F9FAF6',
        'ag-card':          '#F3F4F1',
        'ag-surface':       '#E8E8E5',
        // Text
        'ag-body':          '#1A1C1A',
        'ag-muted':         '#414844',
        'ag-outline':       '#717973',
        // Borders
        'ag-border':        '#C1C8C2',
        // Error
        'ag-error':         '#BA1A1A',
      },
      fontFamily: {
        sans: ['"Public Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'headline-xl': ['32px', { lineHeight: '40px', fontWeight: '800', letterSpacing: '-0.02em' }],
        'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-md': ['18px', { lineHeight: '24px', fontWeight: '700' }],
        'body-lg':     ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md':     ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-bold':  ['14px', { lineHeight: '20px', fontWeight: '700', letterSpacing: '0.05em' }],
        'label-sm':    ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        'card': '12px',
        'btn':  '8px',
      },
      maxWidth: {
        'desktop': '1280px',
      },
      spacing: {
        'sidebar': '240px',
      },
      minHeight: {
        'btn': '56px',
      },
    },
  },
  plugins: [],
}

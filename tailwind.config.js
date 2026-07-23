/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
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
        // Payment / Escrow
        'ag-pay':           '#4CAF50',
        'ag-escrow':        '#F59E0B',
        'ag-escrow-cont':   '#FEF3C7',
        // Risk Levels
        'ag-risk-low':      '#22C55E',
        'ag-risk-mid':      '#EAB308',
        'ag-risk-high':     '#EF4444',
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
        // Error / Dispute
        'ag-error':         '#BA1A1A',
        'ag-dispute':       '#7C3AED',
        'ag-dispute-cont':  '#EDE9FE',
        // Dark Mode surfaces
        'dark-canvas':      '#0A0F0A',
        'dark-card':        '#111711',
        'dark-surface':     '#1A211A',
        'dark-border':      '#2A342A',
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
        'xl2':  '16px',
        'xl3':  '24px',
      },
      maxWidth: {
        'desktop': '1280px',
      },
      spacing: {
        'sidebar':       '260px',
        'sidebar-mini':  '72px',
      },
      minHeight: {
        'btn': '48px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-lg': '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'glass':   '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
        'glow-green': '0 0 20px rgba(74,222,128,0.3)',
        'glow-amber': '0 0 20px rgba(254,147,44,0.3)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 3s linear infinite',
        'bounce-sm':  'bounceSm 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                  to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        bounceSm:  { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
    },
  },
  plugins: [],
}

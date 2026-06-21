/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F0',      // fondo cálido, papel de ticket
        ink: '#1E2A22',        // texto principal, verde-negro de pizarra
        fresh: '#2D6A4F',      // verde día 1-2: alta urgencia FIFO
        amber: '#C98A2C',      // ámbar día 3-4: media urgencia
        pantry: '#8B5E3C',     // marrón día 5+: enlatados/secos
        whatsapp: '#25D366',
        youtube: '#E12B2B',
        line: '#D9D2C2'        // líneas divisoras tipo recibo
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      backgroundImage: {
        'receipt-edge': "repeating-linear-gradient(-45deg, transparent, transparent 4px, #D9D2C2 4px, #D9D2C2 8px)"
      }
    }
  },
  plugins: []
}

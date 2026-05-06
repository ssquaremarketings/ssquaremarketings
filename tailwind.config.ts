import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a3c5e',
        accent: '#e8a020'
      },
      boxShadow: {
        soft: '0 20px 50px rgba(26, 60, 94, 0.12)'
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(rgba(16, 30, 46, 0.72), rgba(16, 30, 46, 0.72)), url('/hero-bg.svg')"
      }
    }
  },
  plugins: []
}

export default config
